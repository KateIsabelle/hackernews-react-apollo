import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useMutation, gql } from '@apollo/client';
import { LINKS_PER_PAGE } from '../constants';
import { FEED_QUERY } from './LinkList';

const CREATE_LINK_MUTATION = gql`
  mutation PostMutation(
    $description: String!
    $url: String!
  ) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`

const CreateLink = () => {
  const history = useHistory();
  const [formState, setFormState] = useState({
    description: '',
    url: ''
  });
  //with the useMutation hook, we must destructure out a function, [createLink], that can used to call the mutation
  const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url
    },
    update: (cache, { data: { post }}) => {
      const take = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = { createdAt: 'desc' };
      //read the current state of the results of the FEED_QUERY:
      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy
        }
      });
      //insert the newest link at beginning and write the query results back to the store
      cache.writeQuery({
        query: FEED_QUERY,
        //we also need to specify the conditions of the original query we’re targeting
        data: {
          feed: {
            links: [post, ...data.feed.links]
          }
        },
        variables: {
          take, 
          skip,
          orderBy
        }
      })
    },
    onCompleted: () => history.push('/')
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createLink();
        }}
      >
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={formState.description}
            onChange={(e) =>
              setFormState({
                ...formState,
                description: e.target.value
              })
            }
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={formState.url}
            onChange={(e) =>
              setFormState({
                ...formState,
                url: e.target.value
              })
            }
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateLink;