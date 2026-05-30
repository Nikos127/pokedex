const pokedexAPI = 'https://pokeapi.co/api/v2/pokemon?limit=50&offset=0';
const loadingTime = 1500;
let allCharacters = [];
let currentPage = 1;
let hasNextPage = true;
let isLoading = false;

function init() {
    loadCharacters();
    setupEventListeners();
}

async function loadCharacters(page = 1) {
    if (isLoading) {
        return;
    }

    const loadingStartedAt = Date.now();
    setLoadingState(true);
    const offset = (page - 1) * 50;
    try {
        const response = await fetch(pokedexAPI.replace('offset=0', `offset=${offset}`));
        const data = await response.json();

        for (let i = 0; i < data.results.length; i++) {
            const detailResponse = await fetch(data.results[i].url);
            const detailData = await detailResponse.json();
            data.results[i] = detailData;            
        }

        if (page === 1) {
            allCharacters = data.results;
        } else {
            allCharacters = allCharacters.concat(data.results);
        }

        hasNextPage = data.next !== null;
        displayCharacters(allCharacters);
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon:', error);
    } finally {
        const elapsedTime = Date.now() - loadingStartedAt;
        if (elapsedTime < loadingTime) {
            await delay(loadingTime - elapsedTime);
        }
        setLoadingState(false);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setLoadingState(loading) {
    isLoading = loading;
    const loader = document.getElementById('loadSpinner');
    const loadMoreButton = document.querySelector('.loadMore button');

    if (loader) {
        loader.hidden = !loading;
    }

    if (loadMoreButton) {
        loadMoreButton.disabled = loading || !hasNextPage;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    const loadMoreButton = document.querySelector('.loadMore button');
    const dialog = document.getElementById('pokeDetailsDialog');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm.length < 3) {
            displayCharacters(allCharacters);
            return;
        }

        let filtered = [];
        for (let i = 0; i < allCharacters.length; i++) {
            if (allCharacters[i].name.toLowerCase().includes(searchTerm)) {
                filtered.push(allCharacters[i]);
            }
        }

        displayCharacters(filtered);
    });
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            if (hasNextPage && !isLoading) {
                currentPage++;
                loadCharacters(currentPage);
            }
        });
    }

    if (dialog) {
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    }
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

function createDialogTypeHtml(character) {
    let html = '';
    for (let i = 0; i < character.types.length; i++) {
        const typeName = character.types[i].type.name;
        html += `<span><img src="${getTypeIconUrl(typeName)}" alt="${typeName}" class="type-icon"> ${typeName}</span>`;
    }
    return html;
}

function createDialogStatsHtml(character) {
    let html = '';
    for (let i = 0; i < character.stats.length; i++) {
        const statName = character.stats[i].stat.name;
        const statValue = character.stats[i].base_stat;
        html += `
            <div class="dialog-stat-row">
                <span>${statName}</span>
                <span>${statValue}</span>
            </div>
        `;
    }
    return html;
}

function createDialogTemplate(character) {
    const firstType = character.types[0]?.type.name || 'normal';
    return `
        <div class="dialog-card ${firstType}">
            <h2>${character.name}</h2>
            <img src="${character.sprites.other.home.front_default}" alt="${character.name}">
            <div class="dialog-types">${createDialogTypeHtml(character)}</div>
            <div class="dialog-stats">${createDialogStatsHtml(character)}</div>
        </div>
    `;
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
    if (!selectedCharacter) {
        return;
    }

    const dialog = document.getElementById('pokeDetailsDialog');
    const dialogContent = document.getElementById('dialogContent');
    if (dialogContent) {
        dialogContent.innerHTML = createDialogTemplate(selectedCharacter);
    }

    if (dialog) {
        dialog.showModal();
    }
}

function closeDialog() {
    const dialog = document.getElementById('pokeDetailsDialog');
    if (dialog) {
        dialog.close();
    }
}

function displayCharacters(characters) {
    const cards = document.getElementById('cards');
    if (!cards) {
        return;
    }

    let html = '';
    for (let i = 0; i < characters.length; i++) {
        html += createCard(characters[i]);
    }
    cards.innerHTML = html;
}

function createCard(character) {
    const firstType = character.types[0]?.type.name || 'unknown';
    const secondType = character.types[1]?.type.name || '';

    let typeHtml = `<img src="${getTypeIconUrl(firstType)}" alt="${firstType}" class="type-icon"> ${firstType}`;
    if (secondType) {
        typeHtml += ` <img src="${getTypeIconUrl(secondType)}" alt="${secondType}" class="type-icon"> ${secondType}`;
    }

    return `
        <div class="card">
            <div class="${firstType} border">${character.name}</div>
            <button onclick="openDialogById(${character.id})" class="${firstType}"><img src="${character.sprites.other.home.front_default}" alt="${character.name}"></button>
            <div class="type">${typeHtml}</div>
        </div>
    `;
}