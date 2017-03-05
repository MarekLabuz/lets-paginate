# lets-paginate

~ Z dedykacją dla K.

**What does it do?**
It provides a set of tools so that you wouldn't bother about paginating and caching your data in a react/redux application.

**How does it work?**
It just stores your cached data in a redux store in chunks, so it can be easily accessed.

**How can I make it work?**
The package consists of a reducer, a middleware and a component wrapper. You need to import all of them to make it work.

***First step:*** Import a reducer from ```'lets-paginate'``` and add it to your main reducer:

```js
// reducers.js
import { reducer } from 'lets-paginate'
// ...
const reducers = {
  // ...
  pagination: reducer
}
// ...
export default combineReducers(reducers)
```

***Second step:*** Import a middleware and add it to ```applyMiddleware``` function provided by ```redux```

```js
import { createStore, applyMiddleware } from 'redux'
import { middleware as paginationMiddleware } from 'lets-paginate'

import reducer from './reducers'
// ...
const store = createStore(reducer, applyMiddleware(paginationMiddleware, thunk, logger))
```

***Third step:*** Import ```reduxPagination``` wrapper and attach it to your component. There are two configuration options you have to provide: ```names``` is an array of unique names for your data, ```fetch``` is a array of functions where you fetch new data from an external source. The rest of the parameters are optional, array ```allDataExpected``` with a value of ```[true]``` indicated that a list ```users``` is going to be fetched only once. Optional function ```mapStateAndDispatchToProps``` is a combination of functions ```mapStateToProps``` and ```mapDispatchToProps``` provided to ```connect``` from ```react-redux``` and works the same way except it takes ```state```, ```dispatch``` and ```ownProps``` arguments at once.

```js
import { reduxPagination } from 'lets-paginate'
// ...
export default reduxPagination({
  names: ['users'],
  fetch: [getUsers],
  allDataExpected: [true] // default - false
}, mapStateAndDispatchToProps)(Users)
```

Third step: Implement function ```fetch```. Example below:

```js
export const getUsers ({ page, entries }, saveData, options) => dispatch =>
  API.users.get({ page, entries })
    .then(response => response.data)
    .catch(() => [])
    .then(data => {
      // function saveData saves your data to redux state, it is necessary
      saveData(data)
    })
```

How you fetch data is up to you as soon as you execute ```saveData``` function with a fetched data. You might use redux-thunk as in the example above however lets-paginate is compatible with redux-saga as well. 

**API reference:**

When you wrap your React component with ```reduxPagination``` (like the example above) and you name your list ```users```, you will get a few new props:
- ```dataUsers``` is a prop that contains a piece of your cached data basing on values of ```page``` and ```entries```. It takes a  value of undefined when new data is being fetched.
- ```pageUsers``` is a number of current page
- ```entriesUsers``` is a number of items on a current page
- ```onPageChangeUsers({ page, entries } [, options])``` is a function that sets new values of ```page``` and ```entries``` and updates ```data```. When your cached data lacks data basing on a new values of ```page``` and ```entries``` it automatically dispatches function ```fetch``` (provided in ```reduxPagination```). Optional argument ```options``` will be passed to the ```fetch``` function as the last argument.
- ```onAddItemUsers(item [, index])``` is a fuction that adds a new element to your cached data at ```index```. Default value of ```index``` is 0. ```onAddItem``` with a value of index equal to -1 adds the item after the last element of cached data.
- ```onRemoveItemUsers(index)``` is a function that removes element at ```index```
- ```resetUsers()``` is a function that deletes all cached data

Notice that props are generated basing on a name of your list is a camelCase practice.

You can provide as many ```names``` as you want. The only requirement is that the length of an each array (```names```, ```fetch``` and ```allDataExpected```) has to be equal. The order in the arrays matters just the same.

```js
export default reduxPagination({
  names: ['streets', 'cities', 'countires'],
  fetch: [getStreets, getCities, getCountries],
  allDataExpected: [false, true, true]
}, mapStateAndDispatchToProps)(Users)
```

Using the example above you will get many generated props: ```dataStreets```, ```dataCities```, ```dataCountires```, ```pageStreets```, ```pageCities```, ```pageCountries```, ```entriesStreets``` etc.

Using the same name for your list in different components gives you an access to the same list stored in a redux store. It is a way to share data between components.

# License
MIT
