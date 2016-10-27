# lets-paginate

~ Z dedykacją dla K.

**What does it do?**
It provides a set of tools so that you wouldn't bother about paginating and caching you data in a react/redux application.

**How does it work?**
It just stores your cached data in a redux store in small chunks, so it can be easily accessed later.

**How can I make it work?**
You need to import a reducer included in a package and add it to your main reducer:

```js
import { reducer } from 'lets-paginate'
// ...
const reducers = {
  // ...
  pagination: reducer
}
// ...
combineReducers(reducers)
```
We're almost done :)
The rest depends on the way you access data from your source.

Simplest implementation:
```js
reduxPagination({
  name: 'users',
  entriesRange: [10, 25, 50],
  action: getUsers
}, mapStateToProps, mapDispatchToProps)(UsersList)
```
```reduxPagination``` returns a React component and it works the same way ```connect``` in react-redux works, so you don't have to import ```connect``` additionally.

- ```name``` is an unique identifier for a list
- ```entriesRange``` is an array where you define possible counts of items on a single page
- ```action``` is a function, but we will get back to it later
- ```mapStateToProps``` and ```mapDispatchToProps``` are functions as you would normally pass to a react-redux ```connect```

A few new props are passed to your React component:
- ```page``` as a number of a current page
- ```entries``` as a number of items displayed on a single page
- ```onPageChange({ page, entries })``` is a function that takes new ```page``` and ```entries```, so if you want to change a page to 5th just execute ```onPageChange({ page: 5 })```. Changing number of ```entries``` works the same way. **Apart from setting pagination, this function also fetches data** so if you just want to change a pagination, ```dispatch(setPagination({ page, entries })``` is your way to go. ```setPagination``` can be imported from a module. **Please keep in mind that variables ```page``` and ```entries``` are shared between your lists, so you need to reset or initialize them yourself.**
- ```resetCachedData(name)``` is a function that you ```dispatch``` in order to reset cached data for a list name ```name```. Your currently displayed data is not being affected.

```action``` from above is a function that takes a function which returs promise as an argument, let me explain it to you :)

Example:
```js
function getUsers (promise) {
    const fetch = ({ page, entries }) => API.user.get(page, entries)
    promise(fetch)
        .then((response) => { /* ... */ })
        .catch((error) => { /* ... */ })
}
```
```fetch``` is a funtion that takes ```{ page, entries }``` and returns a promise that you would use to access data from your source (in my case it is server API call)

All you need to do is to execute ```promise(fetch)```. In response you will get either a response from a ```fetch``` call or an object ```{ data }``` where ```data``` is a cached data (the latter happens when you revisit an already cached page). You need to take care of a ```data``` in your own way, for instance, why not store it in a redux state? :)

**How do I know how to access API call data?** If your ```fetch``` function returns in response something other than ```response.data``` as an array, you need to tell me. No worries, I've came prepared :)

```js
reduxPagination({
    // ...
    responseAccess: response => ({ data: response.data.array })
}, mapStateToProps, mapDispatchToProps)(UsersList)
```

```responseAccess``` is an function that returns an object consisting of ```data```.

I've wrote ```({ data: response.data.array })``` just as an example

Well, actually, that's it :) However if you are curious, there is always something more

**Do you support some fancy data transformations?** I do! :)
There are two more functions you can add.
```js
reduxPagination({
    // ...
    encode: chunk => { /* ... */ }
    decode: array => { /* ... */ }
}, mapStateToProps, mapDispatchToProps)(UsersList)
```
- ```encode``` is a function that takes a ```chunk``` which can be a data (array of items or its part) that is being returned from your source. It simply tells that you want to store your data in the other way than a simple array of items.
- ```decode``` is a function that takes an array which is an array of items that ```encode``` returned. Here you can convert it into something more accessible. The result will be passed to a ```response``` as a ```data```.

Oh, that sounds complicated, but it is not :) Here's an example:

```js
const encode = chunk => chunk.reduce((acc, curr) => ({
    ids: [...acc.ids, curr.id],
    data: { ...acc.data, [curr.id]: curr }
  }), { ids: [], data: {} })

const decode = array => array.reduce((acc, curr) => ({
    ids: [...acc.ids, ...curr.ids],
    data: { ...acc.data, ...curr.data }
  }), { ids: [], data: {} })
```

# License
MIT