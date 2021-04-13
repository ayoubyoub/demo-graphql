const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getMyPosts(_, args, context) {
      try {
        const user = await checkAuth(context);
        const posts = await Post.find({ username: user.username }).sort({
          createdAt: -1,
        });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      console.log("create post");
      const user = checkAuth(context);
      console.log(user);

      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }
      // if we get to this point that means the user is authenticated
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      // return new post. applies to subscription type
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    async deletePost(_, { postId }, context) {
      console.log("delete post");
      const user = checkAuth(context);

      // we need to check that the user is deleting their own post
      try {
        // first find post
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.deleteOne();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      console.log("like post");
      const user = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        // check if we've liked the post already or not
        if (post.likes.find((like) => like.username === user.username)) {
          // if we've already liked the post, then unlike it
          post.likes = post.likes.filter(
            (like) => like.username !== user.username
          );
        } else {
          // if we haven't liked the post, then like it
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        }
        // save the edited post
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      // array function version
      // all caps is convention for this 'event type thing'
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
