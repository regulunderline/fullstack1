import { useEffect, useState } from 'react'
import personService from './services/persons'

const Filter = ({onChange}) => {
  return(
    <div>filter shown with <input onChange={onChange}/></div>
  )} 

const Notification = ({ message }) => {
  if (message[0] === null) {
    return null
  }
  if (message[1]) {
    return (
      <div className='success'>
        {message[0]}
      </div>
    )
  }
  else {
    return (
      <div className='error'>
        {message[0]}
      </div>
    )
  }
}

const PersonForm = ({doesExist, handleNameChange, handleNumberChange, newName, newNumber}) => 
  <form onSubmit={doesExist}>
    <div>
      name: <input value={newName} onChange={handleNameChange}/>
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange}/>
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>

const Persons = ({persons, newFilter, handleDelete}) =>
  <div>
    {
    persons.filter((person) => 
      person.name.toLowerCase().includes(newFilter.toLowerCase())).map(person => 
      <div key={person.id}>
        {person.name} {person.number}
        <button value={person.name} onClick={handleDelete}>
          Delete
          </button>
      </div>)}
    
  </div>

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [newMessage, setMessage] = useState([null, true])

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  },[])
  
  const addName = () => {
    const addPerson = {
      name : newName,
      number : newNumber,
      id : String(+persons[persons.length - 1].id + 1)
    }

    personService.create(addPerson).then((requestedPerson) => {
      setPersons(persons.concat(requestedPerson))
      setNewName('')
      setNewNumber('')
      setMessage([`Added ${requestedPerson.name}`, true])
      setTimeout(() => {
        setMessage([null, true])
      }, 5000)
    })
  }

  const doesExist = (event) => {
    event.preventDefault()
    if (persons.some(person => person.name===newName)){ 
      if (confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){  
        const changedPerson = persons.find(person => person.name === newName)
        changedPerson.number = newNumber
        personService.changeNumber(changedPerson)
          .then((returnedPerson) => {
            const changedPersons = persons.map((person) => 
              person.id === returnedPerson.id 
                ? returnedPerson
                : person
            )
            setPersons(changedPersons)
            setNewName('')
            setNewNumber('')
            setMessage([`Updated ${changedPerson.name}'s number`, true])
            setTimeout(() => {
              setMessage([null, true])
            }, 5000)
          })
          .catch(error => {
            setMessage([`Information of ${newName} has already been removed from the server`, false])
            setTimeout(() =>{
              setMessage([null,true])
            }, 5000)
            setPersons(persons.filter((person) => person.name !== newName))
          })
      }
    }
    else{
      addName()
    }
  }
 
  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleDelete = (event) => {
    if (persons.some(person => person.name === event.target.value)){
      const personToDelete = persons.find(person => person.name === event.target.value)
      confirm(`Delete ${personToDelete.name} ?`) && personService.personDelete(personToDelete.id)
        ? setPersons(persons.filter((person) => person.id !== personToDelete.id)) 
        : alert(`${personToDelete} is already deleted`)
    } 
    else {
      alert(`${event.target.value} is already deleted`)
    }
  } 
  
  return (
    <div>
      <h1>Phonebook</h1>

      <Notification message={newMessage} />

      {<Filter onChange={(event) => setNewFilter(event.target.value)}/>}

      <h2>add a new</h2>

      {<PersonForm 
      doesExist={doesExist} 
      handleNameChange={handleNameChange} 
      handleNumberChange={handleNumberChange} 
      newName={newName} 
      newNumber={newNumber}
      />}

      <h2>Numbers</h2>

      {<Persons persons={persons} newFilter={newFilter} handleDelete={handleDelete}/> }
    </div>
  )
}

export default App