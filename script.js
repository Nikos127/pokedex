let pokeData = 'https://pokeapi.co/api/v2/pokemon?limit=10&offset=0';

async function getPokeJson() {
    let response = await fetch(pokeData);
    let jsonData = await response.json(); // Die "Box öffnen" und Inhalt in Variable speichern

    console.log("Die ganze Schatzkiste:", jsonData);

    // Jetzt können wir die einzelnen Schätze anschauen:
    console.log("Wie viele Pokémon gibt es insgesamt?", jsonData.count);
    console.log("Liste der ersten 10 Pokémon:", jsonData.results);

    // Durch jeden Pokémon "durchlaufen" wie durch eine Spielzeugkiste:
    jsonData.results.forEach((pokemon, index) => {
        console.log(`Pokémon ${index + 1}:`, pokemon.name, "- URL:", pokemon.url);
    });

    return jsonData; // Die Schätze zurückgeben, damit andere sie auch nutzen können
}

// BONUS: Wie man noch MEHR Details über ein einzelnes Pokémon bekommt!
async function getDetailedPokemonInfo(pokemonUrl) {
    console.log("🔍 Schaue genauer in eine spezielle Schatztruhe...");

    let response = await fetch(pokemonUrl);
    let pokemonDetails = await response.json();

    console.log("🎉 WOW! Schau was alles in dieser Truhe ist:");
    console.log("Name:", pokemonDetails.name);
    console.log("Höhe:", pokemonDetails.height);
    console.log("Gewicht:", pokemonDetails.weight);
    console.log("Typen:", pokemonDetails.types.map(type => type.type.name));
    console.log("Fähigkeiten:", pokemonDetails.abilities.map(ability => ability.ability.name));
    console.log("Bild:", pokemonDetails.sprites.front_default);

    return pokemonDetails;
}

// Beispiel: Lass uns das erste Pokémon genauer anschauen
async function exploreFirstPokemon() {
    let basicData = await getPokeJson();
    let firstPokemonUrl = basicData.results[0].url;
    let detailedInfo = await getDetailedPokemonInfo(firstPokemonUrl);
}