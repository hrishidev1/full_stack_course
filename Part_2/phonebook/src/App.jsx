import { useEffect, useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const changeNumber = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (!changeNumber) {
        return
      }

      const updatedPerson = {
        ...existingPerson,
        number: newNumber
      }

      personService
        .update(existingPerson.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person =>
            person.id === existingPerson.id ? returnedPerson : person
          ))

          setNewName('')
          setNewNumber('')
          setMessage(`${newName}'s number was updated`)

          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(() => {
          setErrorMessage(
            `${newName} was already removed from the phonebook`
          )

          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)

          setPersons(persons.filter(person => person.id !== existingPerson.id))
        })

      return
    }

    const person = {
      name: newName,
      number: newNumber
    }

    personService
      .create(person)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setMessage(`${newName} was added to the phonebook`)

        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)

    if (!window.confirm(`Delete ${person.name}?`)) {
      return
    }

    personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      {message && (
        <div style={{
          color: 'green',
          background: 'lightgrey',
          padding: '10px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}

      {errorMessage && (
        <div style={{
          color: 'red',
          background: 'lightgrey',
          padding: '10px',
          marginBottom: '10px'
        }}>
          {errorMessage}
        </div>
      )}

      <Filter
        search={search}
        handleSearchChange={handleSearchChange}
      />

      <h2>Add a new</h2>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>

      <Persons
        persons={personsToShow}
        deletePerson={deletePerson}
      />
    </div>
  )
}

export default App