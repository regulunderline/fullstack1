import axios from 'axios'
const baseUrl = 'http://localhost:3001/persons/'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then((response) => response.data)
}

const create = (addPerson) => {
    const request = axios.post(baseUrl, addPerson)
    return request.then((response) => response.data)
}

const personDelete = (idToDelete) => {
    const request = axios.delete(`${baseUrl}${idToDelete}`)
    return request.then(() => true).catch(() => false)
}

const changeNumber = (changedPerson) => {
    const request = axios.put(`${baseUrl}${changedPerson.id}`, changedPerson)
    return request.then((response) => response.data)
}

export default {getAll, create, personDelete, changeNumber}