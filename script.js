let rickAMortyData = 'https://rickandmortyapi.com/api/character';

async function getPokeJson() {
    let response = await fetch(rickAMortyData);
    let allData = await response.json();
    let character = allData.results;
    console.log(character);


    for (let i = 0; i < character.length; i++) {
        document.getElementById('cards').innerHTML += cardsREF(character, i);
    }
}

function cardsREF(character, i){
     return `
     <div class="card">
        <div id="name">${character[i].name}</div>
        <img src="${character[i].image}" alt=""></img>
        <div id="speciesStatus">${character[i].species} Status: ${character[i].status}</div>
     </div>
     `
}