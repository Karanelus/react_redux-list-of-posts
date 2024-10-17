import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import * as commentsApi from '../api/comments';
import { CommentData } from '../types/Comment';
import { useAppSelector } from '../hooks/useAppSelector.hook';
import {
  addNewComment,
  fetchPostComments,
  takeError,
  deleteComment as deleteChosenComment,
} from '../slices/comments.slice';
import { useAppDispatch } from '../hooks/useAppDispatch.hook';
import { Post } from '../types/Post';

type Props = {
  post: Post;
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const dispatch = useAppDispatch();
  const {
    loaded,
    hasError,
    items: comments,
  } = useAppSelector(state => state.comments);
  const [visible, setVisible] = useState(false);

  // The same useEffect with async/await

  const loadComments = (newPostId: number) => {
    dispatch(fetchPostComments(newPostId));
  };

  useEffect(() => {
    setVisible(false);
    loadComments(post.id);
  }, [post]);

  // effect can return only a function but not a Promise

  const addComment = async ({ name, email, body }: CommentData) => {
    if (post) {
      try {
        const newComment = await commentsApi.createComment({
          name,
          email,
          body,
          postId: post?.id,
        });

        dispatch(addNewComment(newComment));
      } catch (error) {
        // we show an error message in case of any error
        takeError();
      }
    }
  };

  const deleteComment = async (commentId: number) => {
    // we delete the comment immediately so as
    // not to make the user wait long for the actual deletion
    // eslint-disable-next-line max-len
    dispatch(deleteChosenComment(commentId));

    await commentsApi.deleteComment(commentId);
  };

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        <h2 data-cy="PostTitle">{`#${post.id}: ${post.title}`}</h2>

        <p data-cy="PostBody">{post.body}</p>
      </div>

      <div className="block">
        {loaded && <Loader />}

        {!loaded && hasError && (
          <div className="notification is-danger" data-cy="CommentsError">
            Something went wrong
          </div>
        )}

        {!loaded && !hasError && comments.length === 0 && (
          <p className="title is-4" data-cy="NoCommentsMessage">
            No comments yet
          </p>
        )}

        {!loaded && !hasError && comments.length > 0 && (
          <>
            <p className="title is-4">Comments:</p>

            {comments.map(comment => (
              <article
                className="message is-small"
                key={comment.id}
                data-cy="Comment"
              >
                <div className="message-header">
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                    {comment.name}
                  </a>

                  <button
                    data-cy="CommentDelete"
                    type="button"
                    className="delete is-small"
                    aria-label="delete"
                    onClick={() => deleteComment(comment.id)}
                  >
                    delete button
                  </button>
                </div>

                <div className="message-body" data-cy="CommentBody">
                  {comment.body}
                </div>
              </article>
            ))}
          </>
        )}

        {!loaded && !hasError && !visible && (
          <button
            data-cy="WriteCommentButton"
            type="button"
            className="button is-link"
            onClick={() => setVisible(true)}
          >
            Write a comment
          </button>
        )}

        {!loaded && !hasError && visible && (
          <NewCommentForm onSubmit={addComment} />
        )}
      </div>
    </div>
  );
};
