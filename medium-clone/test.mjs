// THIS WAY WE CAN RETURN THE VALUE COMING FROM THE API
import fetch from 'cross-fetch';

const getData = async() => {
    // BOTH METHOD IS USED TO RETURN THE FETCHED VALUE

    // return await (await fetch(`https://api.publicapis.org/entries`)).json()
    const data = await fetch(`https://api.publicapis.org/entries`)
    const dataParsed = await data.json()
    return dataParsed
}

getData().then(data => console.log(data.entries[10].API));