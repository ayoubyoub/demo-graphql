const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/check-auth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      // check if user is authorized to create a comment
      const user = checkAuth(context);

      // validates comment body is not empty string
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }

      // find the post to comment on
      const post = await Post.findById(postId);

      // if the post exists, add the comment to the front of the comments array using unshift
      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
        // user input error b/c they tried to access an ID that doesn't exist and our client shouldn't expose an id that doesn't exist
      } else throw new UserInputError("Post not found");
    },
    async deleteComment(_, { postId, commentId }, context) {
      const user = checkAuth(context);

      const post = await Post.findById(postId);

      // if post that the comment belongs to doesn't exist then proceed else throw userinputerror
      if (post) {
        // find comment in array of comments
        const commentIndex = post.comments.findIndex(
          (comment) => comment.id === commentId
        );

        // delete if username of logged in user matches username of comment
        if (post.comments[commentIndex].username === user.username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          // we're not including an error object like we did with createComment because this is more of a safety net than something that will actually be displayed on the front end. ie there's not going to be a delete button for users who didn't write the comment. this is more as a safety net if someone if trying to delete the comment using code
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
