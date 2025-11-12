import axios from 'axios';

axios
  .get('https://jsonplaceholder.typicode.com/todos/1')
  .then((res: any) => {
    console.log(res);
  })
  .catch((err: any) => {
    console.log(err);
  });
