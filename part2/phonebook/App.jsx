import { useEffect, useState } from 'react'
import Filter from './components/Filter'
import Notification from './components/Notification'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [filter, setFilter] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(persons => setPersons(persons))
      .catch(() => showNotification('Unable to load phonebook'))
  }, [])

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  const handleFilterChange = event => setFilter(event.target.value)
  const handleNameChange = event => setNewName(event.target.value)
  const handleNumberChange = event => setNewNumber(event.target.value)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const addPerson = event => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (!window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )) {
        return
      }

      const updatedPerson = { ...existingPerson, number: newNumber }

      personService.update(existingPerson.id, updatedPerson).then(returnedPerson => {
        setPersons(persons.map(person =>
          person.id === returnedPerson.id ? returnedPerson : person
        ))
        showNotification(`Number for ${returnedPerson.name} updated`)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        const message = error.response?.status === 404
          ? `${existingPerson.name} was already removed from the server`
          : `Could not update ${existingPerson.name}`
        showNotification(message, 'error')
        setPersons(persons.filter(person => person.id !== existingPerson.id))
      })
      return
    }

    const newPerson = { name: newName, number: newNumber }

    personService.create(newPerson).then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
      showNotification(`${returnedPerson.name} added to phonebook`)
        setNewName('')
        setNewNumber('')
      })
      .catch(() => showNotification(`Could not add ${newPerson.name}`, 'error'))
  }

  const handleDelete = person => {
    if (!window.confirm(`Delete ${person.name}?`)) {
      return
    }

    personService.remove(person.id).then(() => {
      setPersons(persons.filter(currentPerson => currentPerson.id !== person.id))
    })
      .catch(() => {
        showNotification(`Could not delete ${person.name}`, 'error')
      })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification
        message={notification?.message ?? null}
        type={notification?.type}
      />
      <Filter value={filter} onChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        name={newName}
        number={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={handleDelete} />
    </div>
  )
}

export default App