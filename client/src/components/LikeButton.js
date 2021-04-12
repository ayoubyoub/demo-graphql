import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";

import MyPopup from "../utils/MyPopup";

export default function LikeButton({ post: { id, likes, likeCount }, user }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (user && likes.find((like) => like.username === user.username)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, likes]);

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: {
      postId: id,
    },
    onError(err) {
      console.log(err.graphQLErrors);
    },
  });

  const likeButton = user ? (
    liked ? (
      <Button
        color="teal"
        icon="heart"
        label={{
          basic: true,
          color: "teal",
          pointing: "left",
          content: likeCount,
        }}
        onClick={likePost}
      />
    ) : (
      <Button
        color="teal"
        icon="heart"
        label={{
          basic: true,
          color: "teal",
          pointing: "left",
          content: likeCount,
        }}
        basic
        onClick={likePost}
      />
    )
  ) : (
    <Button
      color="teal"
      icon="heart"
      label={{
        basic: true,
        color: "teal",
        pointing: "left",
        content: likeCount,
      }}
      basic
      as={Link}
      to="/login"
      onClick={likePost}
    />
  );

  return <MyPopup content={liked ? "Unlike" : "Like"}>{likeButton}</MyPopup>;
}

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
        username
      }
      likeCount
    }
  }
`;
