import Storage from './Storage'

const local = new Storage(window.localStorage)

export default local

export const { getItem: loadFromLocalStorage, setItem: saveToLocalStorage, removeItem: removeFromLocalStorage } = local
