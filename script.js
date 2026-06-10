const pokedexAPI = 'https://pokeapi.co/api/v2/pokemon?limit=30&offset=0';
const loadingTime = 1500;
const pokedexStorageKey = 'pokedexData';
let allCharacters = [];
let currentPage = 1;
let hasNextPage = true;
let isLoading = false;

function init() {
    const savedData = loadFromLocalStorage();
    if (savedData) {
        allCharacters = savedData.allCharacters;
        currentPage = savedData.currentPage;
        hasNextPage = savedData.hasNextPage;
        displayCharacters(allCharacters);
    } else {
        loadCharacters();
    }

    setupEventListeners();
}

async function loadCharacters(page = 1) {
    const loadingStartedAt = Date.now();
    setLoadingState(true);
    try {
        const data = await getCharactersData(page);
        mergeCharacters(page, data.results);
        hasNextPage = data.next !== null;
        displayCharacters(allCharacters);
        saveToLocalStorage();
    } finally {
        await finishLoadingState(loadingStartedAt);
    }
}

async function getCharactersData(page) {
    const offset = (page - 1) * 30;
    const response = await fetch(pokedexAPI.replace('offset=0', `offset=${offset}`));
    const data = await response.json();
    await loadCharacterDetails(data.results);
    return data;
}

function mergeCharacters(page, results) {
    if (page === 1) {
        allCharacters = results;
        return;
    }
    allCharacters = allCharacters.concat(results);
}

async function finishLoadingState(loadingStartedAt) {
    const elapsedTime = Date.now() - loadingStartedAt;
    if (elapsedTime < loadingTime) {
        await delay(loadingTime - elapsedTime);
    }
    setLoadingState(false);
}

async function loadCharacterDetails(results) {
    for (let i = 0; i < results.length; i++) {
        const detailResponse = await fetch(results[i].url);
        const detailData = await detailResponse.json();
        results[i] = detailData;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getStorageTypesAndStats(character) {
    let types = [];
    for (let i = 0; i < character.types.length; i++) {
        types.push({ type: { name: character.types[i].type.name } });
    }

    let stats = [];
    for (let i = 0; i < character.stats.length; i++) {
        stats.push({
            base_stat: character.stats[i].base_stat,
            stat: { name: character.stats[i].stat.name }
        });
    }

    return { types, stats };
}

function toStorageCharacter(character) {
    let storageData = getStorageTypesAndStats(character);
    let types = storageData.types;
    let stats = storageData.stats;

    return {
        id: character.id,
        name: character.name,
        types,
        stats,
        sprites: {
            other: {
                home: {
                    front_default: character.sprites.other.home.front_default
                }
            }
        }
    };
}

function saveToLocalStorage() {
    let compactCharacters = [];
    for (let i = 0; i < allCharacters.length; i++) {
        compactCharacters.push(toStorageCharacter(allCharacters[i]));
    }

    const saveData = {
        allCharacters: compactCharacters,
        currentPage,
        hasNextPage
    };
    localStorage.setItem(pokedexStorageKey, JSON.stringify(saveData));
}

function loadFromLocalStorage() {
    const loadData = localStorage.getItem(pokedexStorageKey);
    return loadData ? JSON.parse(loadData) : null;
}

function setLoadingState(loading) {
    isLoading = loading;
    const loader = document.getElementById('loadSpinner');
    const loadMoreButton = document.querySelector('.loadMore button');
    loader.hidden = !loading;
    loadMoreButton.disabled = loading || !hasNextPage;
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    const loadMoreButton = document.querySelector('.loadMore button');
    const dialog = document.getElementById('pokeDetailsDialog');

    searchInput.addEventListener('input', handleSearchInput);
    loadMoreButton.addEventListener('click', handleLoadMoreClick);
    dialog.addEventListener('click', handleDialogClick);
}

function handleSearchInput(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    if (searchTerm.length < 3) {
        displayCharacters(allCharacters, false);
        return;
    }
    displayCharacters(filterCharacters(searchTerm), true);
}

function handleLoadMoreClick() {
    if (hasNextPage && !isLoading) {
        currentPage++;
        loadCharacters(currentPage);
    }
}

function handleDialogClick(event) {
    const dialog = document.getElementById('pokeDetailsDialog');
    if (event.target === dialog) {
        dialog.close();
    }
}

function filterCharacters(searchTerm) {
    let filtered = [];
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].name.toLowerCase().includes(searchTerm)) {
            filtered.push(allCharacters[i]);
        }
    }
    return filtered;
}

function getTypeIconUrl(typeName) {
    const typeIds = {
        normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
        bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
        electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
    };

    const typeId = typeIds[typeName] || 1;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/small/${typeId}.png`;
}

function findCharacterById(characterId) {
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].id === characterId) {
            return allCharacters[i];
        }
    }
    return null;
}

function openDialogById(characterId) {
    const selectedCharacter = findCharacterById(characterId);
    updateDialogContent(selectedCharacter);
    const dialog = document.getElementById('pokeDetailsDialog');
    dialog.showModal();
}

function getWrappedCharacterId(characterId, step) {
    let targetId = characterId + step;
    if (targetId < 1) {
        targetId = allCharacters.length;
    }
    if (targetId > allCharacters.length) {
        targetId = 1;
    }
    return targetId;
}

function updateDialogContent(selectedCharacter) {
    const dialog = document.getElementById('pokeDetailsDialog');
    const dialogContent = document.getElementById('dialogContent');
    dialogContent.innerHTML = createDialogTemplate(selectedCharacter);
}

function openDialogByPrevId(characterId) {
    let targetId = getWrappedCharacterId(characterId, -1);
    const selectedCharacter = findCharacterById(targetId);
    updateDialogContent(selectedCharacter);
}

function openDialogByNextId(characterId) {
    let targetId = getWrappedCharacterId(characterId, 1);
    const selectedCharacter = findCharacterById(targetId);
    updateDialogContent(selectedCharacter);
}

function closeDialog() {
    const dialog = document.getElementById('pokeDetailsDialog');
    dialog.close();
}

function displayCharacters(characters, isSearchResult = false) {
    const cards = document.getElementById('cards');
    const loadMoreButton = document.querySelector('.loadMore button');

    if (characters.length === 0) {
        loadMoreButton.disabled = true;
        cards.innerHTML = noResultsHtml();
        return;
    }

    cards.innerHTML = createCardsHtml(characters);
    loadMoreButton.disabled = isSearchResult || isLoading || !hasNextPage;
}

function createCardsHtml(characters) {
    let html = '';
    for (let i = 0; i < characters.length; i++) {
        html += createCard(characters[i]);
    }
    return html;
}