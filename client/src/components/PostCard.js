import React, { useContext } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { Card, Image, Button } from "semantic-ui-react";

import { AuthContext } from "../context/auth";
import LikeButton from "./LikeButton";
import DeleteButton from "./DeleteButton";
import MyPopup from "../utils/MyPopup";

export default function PostCard({
  post: { body, createdAt, id, username, likeCount, commentCount, likes },
}) {
  const context = useContext(AuthContext);

  return (
    <Card fluid>
      <Card.Content>
        <Image
          floated="right"
          size="mini"
          src="https://react.semantic-ui.com/images/avatar/large/molly.png"
        />
        <Card.Header>{username}</Card.Header>
        <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
        <Card.Description as={Link} to={`/posts/${id}`}>
          {body}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <LikeButton user={context.user} post={{ id, likes, likeCount }} />
        {/* TODO: perhaps make separate comment button component */}
        <MyPopup content="Comment on post">
          <Button
            color="blue"
            icon="comments"
            label={{
              basic: true,
              color: "blue",
              pointing: "left",
              content: commentCount,
            }}
            basic
            as={Link}
            to={`/posts/${id}`}
          />
        </MyPopup>
        {context.user && context.user.username === username && (
          <DeleteButton postId={id} />
        )}
      </Card.Content>
    </Card>
  );
}
