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
         <div data-id="overlay-pokemon-name" class="dialog-card ${firstType}">
            <h2>${character.name}</h2>
            <img data-id="dialog-image" src="${character.sprites.other.home.front_default}" alt="${character.name}">
            <div class="dialog-types">${createDialogTypeHtml(character)}</div>
            <div class="dialog-stats">${createDialogStatsHtml(character)}</div>
            <div class="navigationArrows">
                <button data-id="prev-button" onclick="openDialogByPrevId(${character.id})" style="rotate: 180deg;"><img src="./images/arrow.png" alt=""></button>
                <button data-id="next-button" onclick="openDialogByNextId(${character.id})"><img src="./images/arrow.png" alt=""></button>
            </div>
    `;
}

function noResultsHtml() {
    return `
        <div class="no-results">
            <h3>No match in the Pokedex</h3>
            <p data-id="not-found">This Pokemon is hiding really well right now.</p>
            <span>Try a different name or just the first few letters.</span>
        </div>
    `;
}

function createCard(character) {
    const firstType = character.types[0]?.type.name || 'unknown';
    const secondType = character.types[1]?.type.name || '';

    let typeHtml = `<img src="${getTypeIconUrl(firstType)}" alt="${firstType}" class="type-icon"> ${firstType}`;
    if (secondType) {
        typeHtml += ` <img src="${getTypeIconUrl(secondType)}" alt="${secondType}" class="type-icon"> ${secondType}`;
    }

    return `
        <div data-id="card" class="card">
            <div class="${firstType} border">${character.name}</div>
            <button onclick="openDialogById(${character.id})" class="${firstType}"><img data-id="card-image" src="${character.sprites.other.home.front_default}" alt="${character.name}"></button>
            <div class="type">${typeHtml}</div>
        </div>
    `;
}
