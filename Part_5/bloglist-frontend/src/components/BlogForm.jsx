import { useState } from 'react'
import styled from 'styled-components'

const FormContainer = styled.div`
  max-width: 420px;
  margin: 40px auto;
  padding: 32px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`

const FormLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
`

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.15);
  }
`

const CreateButton = styled.button`
  align-self: flex-start;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #646cff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
  }
`

const BlogForm = ({ createBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addBlog = async event => {
    event.preventDefault()

    await createBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl
    })

    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <FormContainer>
      <h3>create new</h3>

      <Form onSubmit={addBlog}>
        <FormField>
          <FormLabel>
            title
            <FormInput
              type="text"
              value={newTitle}
              onChange={({ target }) => setNewTitle(target.value)}
            />
          </FormLabel>
        </FormField>

        <FormField>
          <FormLabel>
            author
            <FormInput
              type="text"
              value={newAuthor}
              onChange={({ target }) => setNewAuthor(target.value)}
            />
          </FormLabel>
        </FormField>

        <FormField>
          <FormLabel>
            url
            <FormInput
              type="text"
              value={newUrl}
              onChange={({ target }) => setNewUrl(target.value)}
            />
          </FormLabel>
        </FormField>

        <CreateButton type="submit">
          create
        </CreateButton>
      </Form>
    </FormContainer>
  )
}

export default BlogForm