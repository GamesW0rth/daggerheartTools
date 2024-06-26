document.addEventListener("DOMContentLoaded", function() {
    setupSession();
    fetch("advisaries.json")
    .then(response => response.json())
    .then(data => {
        loadedAdvisaries = data.advisaries;
        advisaryMasterList= [...loadedAdvisaries,...customAdvisaries];
        advisaryMasterList = advisaryMasterList.sort((a,b) => parseInt(a.Tier)-parseInt(b.Tier));
        searchList=advisaryMasterList
        //displayAdvisaries(advisaryMasterList);
        refreshMiddlePane();
        generateLoops();
        setupSearch();
        //displayPlayedAdvisaries(selectedAdvisaries);
        displayAdvisaryShortList(advisaryMasterList);
        setupGMControls();
        saveSession();
    })
    .catch(error => console.error("Error fetching advisaries:", error));
});

function saveJsonToLocalStorage(key, jsonData) {
    // Convert the JSON object to a string
    const jsonString = JSON.stringify(jsonData);
    // Save the string to localStorage under the specified key
    localStorage.setItem(key, jsonString);
}
function loadJsonFromLocalStorage(key) {
    // Retrieve the data string from localStorage
    const jsonString = localStorage.getItem(key);
    // Parse the string back into JSON
    if (jsonString) {
        return JSON.parse(jsonString);
    }
    return null; // Return null if the key doesn't exist
}
function loadJsonArrayFromLocalStorage(key) {
    // Retrieve the data string from localStorage
    const jsonString = localStorage.getItem(key);
    // Parse the string back into a JSON array
    if (jsonString) {
        return JSON.parse(jsonString);
    }
    // Return an empty array if the key doesn't exist or data is null
    return [];
}
function saveSession(){
    saveJsonToLocalStorage("playedAdvisary",selectedAdvisaries);
    saveJsonToLocalStorage("latestPlayId",LatestPlayId);
    saveJsonToLocalStorage("GMControlState",GMControlState);
    saveJsonToLocalStorage("advisaryVanilla",loadedAdvisaries);
    saveJsonToLocalStorage("loops",loops);
    saveJsonToLocalStorage("playList",playList);
}
function setupSession(){
    selectedAdvisaries = loadJsonArrayFromLocalStorage('playedAdvisary');
    loops = loadJsonArrayFromLocalStorage('loops');
    LatestPlayId = loadJsonFromLocalStorage('latestPlayId');
    GMControlState = loadJsonFromLocalStorage('GMControlState');
    customAdvisaries = loadJsonArrayFromLocalStorage('customAdvisary');
    playList = loadJsonFromLocalStorage('playList');

    if (GMControlState == null){
        GMControlState = {
            fear:2,
            actions:0
        };
    }
}

let selectedAdvisaries = [];//list of advisaries in pllay
let loadedAdvisaries = []; //Advisaries loaded from master file
let advisaryMasterList= [];// list combining loaded and custom advisaries
let customAdvisaries = [];//custom made advisaries loaded from session
let searchList=[];
let loops = [];
let playList = false;

const actionColorStyles={
    "Action":"background-image: linear-gradient(to right,rgba(255, 0, 0, 0.1),transparent ,transparent , transparent );",
    "Action (2)":"background-image: linear-gradient(to right,rgba(255, 0, 0, 0.2),transparent ,transparent , transparent );",
    "Action (3)":"background-image: linear-gradient(to right,rgba(255, 0, 0, 0.3),transparent ,transparent , transparent );",
    "Action - Fear":"background-image: linear-gradient(to right,rgba(255, 99, 179, 0.4),transparent ,transparent , transparent );",
    "Passive":"background-image: linear-gradient(to right,rgba(0, 140, 255, 0.1),transparent ,transparent , transparent );",
    "Reaction":"background-image: linear-gradient(to right,rgba(132, 0, 255, 0.1),transparent ,transparent , transparent );"
}
const tierColorTypes = {
    0 : "#bcceeb",
    1 : "#abd99e",
    2 : "#d9d49e",
    3 : "#cf8686"
}
var LatestPlayId = 0;
var GMControlState ={};

function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
}

function refreshMiddlePane(){
    const butn = document.getElementById("swapButton");
    if(playList){
        displayPlayedAdvisaries(selectedAdvisaries);
        butn.innerText = "Show All"
    }
    else{
        displayAdvisaries(advisaryMasterList);
        butn.innerText = "Show Active"
    }
}

function swapDisplay(button){
    playList=!playList;
    saveSession();
    refreshMiddlePane();
}

function toggleDescription(index) {
    const card = document.getElementById(`card-${index}`);
    
    if (card.classList.contains("ishidden")) {
        // Hide description and show only header
        card.classList.remove("ishidden");
        card.querySelector('.left-column').style.display = 'none';
        card.querySelector('.right-column').style.display = 'none';
    } else {
        // Show description along with header and other columns
        card.classList.add("ishidden");
        card.querySelector('.left-column').style.display = 'block';
        card.querySelector('.right-column').style.display = 'block';
    }
}

function createAndAppendAdvisaryCards(advisaries, containerId, shouldToggle) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous content
    
    if (!container) {
        console.error("Container not found:", containerId);
        return;
    }

    advisaries.forEach((advisary) => {
        const card = getPlainCard(advisary);
        container.appendChild(card);
    });
}

function generateResource(resource,resourceMax){
    var resourceDiv = document.createElement("div");
    resourceDiv.classList.add("bubble-text");
    var resourcePercentage = (resource/resourceMax)* 100;
    if (resourcePercentage == 0){
        resourceDiv.style.backgroundColor = "#bf042c";
        resourceDiv.style.color =  "yellow";
    }
    else if (resourcePercentage>0 && resourcePercentage<=25){
        resourceDiv.style.backgroundColor = "#f08d62";
    }
    else if (resourcePercentage>25 && resourcePercentage<=50){
        resourceDiv.style.backgroundColor = "#e9f062";
    }
    else if (resourcePercentage>50 && resourcePercentage<=75){
        resourceDiv.style.backgroundColor = "#b9f062";
    }
    else if (resourcePercentage>75 && resourcePercentage<=100){
        resourceDiv.style.backgroundColor = "#46db4e";
    }
    resourceDiv.appendChild(document.createTextNode(`${resource}/${resourceMax}`));
    return(resourceDiv);
}

function generateThresholds(thresholds,playId,childId = -1){
    const newDiv = document.createElement("div");
    const minorThresh = document.createElement("div");
    minorThresh.classList.add("button-text");
    minorThresh.appendChild(document.createTextNode(`Min:${thresholds.Minor}`));
    minorThresh.onclick = function(){changeAdvHealthOnClick(-1,playId,childId)};
    newDiv.appendChild(minorThresh);
    if(thresholds["Major"]){

        const majorThresh = document.createElement("div");
        majorThresh.classList.add("button-text");
        majorThresh.appendChild(document.createTextNode(`Maj:${thresholds.Major}`));
        majorThresh.onclick = function(){changeAdvHealthOnClick(-2,playId,childId)};
        newDiv.appendChild(majorThresh);
        
        if (thresholds["Severe"]){
        
            const severeThresh = document.createElement("div");
            severeThresh.classList.add("button-text");
            severeThresh.appendChild(document.createTextNode(`Sev:${thresholds.Severe}`));
            severeThresh.onclick = function(){changeAdvHealthOnClick(-3,playId,childId)};
            newDiv.appendChild(severeThresh);
        }
    }
    return newDiv;
}

function removeAdvChild(playedAdvId,childId){
    selectedAdvisaries.forEach(playedAdv =>{
        if (playedAdv.playId == playedAdvId){
            
            const ifTwo = (Object.keys(playedAdv.advChildren).length ==2);
            playedAdv.advChildren.forEach(childAdv =>{
                if(childAdv.ChildId == childId){
                    playedAdv.advChildren.splice(playedAdv.advChildren.indexOf(childAdv),1);
                }
            });
            if (ifTwo){
                selectedAdvisaries[selectedAdvisaries.indexOf(playedAdv)].health = playedAdv.advChildren[0].HP;
                selectedAdvisaries[selectedAdvisaries.indexOf(playedAdv)].stress = playedAdv.advChildren[0].Stress;
                selectedAdvisaries[selectedAdvisaries.indexOf(playedAdv)].advChildren.splice(0,1);
            }
            }
        });
        refreshMiddlePane();
}

function addAdvChildToPlayed(playedAdv){
    const name = playedAdv.linkedAdvisary.Name + " ";
    var usedIds = [];
    usedIds.push(0);
    playedAdv.advChildren.forEach(ch => {
        usedIds.push(ch.ChildId);
    });
    var newId = 0;
    while(usedIds.includes(newId)){
        newId++
    }
    //first child inherits health
    if (Object.keys(playedAdv.advChildren).length<=0){
        health = parseInt(playedAdv.health);
        stress = parseInt(playedAdv.stress);
        var newChild = {
            HP : parseInt(playedAdv.health),
            Stress : parseInt(playedAdv.stress),
            ChildId : newId ,
            Name: playedAdv.linkedAdvisary.Name + " " + newId
        }
        playedAdv.advChildren.push(newChild);
        usedIds.push(newId);
        while(usedIds.includes(newId)){
            newId++
        }
    }
    //additional children
    var newChild = {
        HP : parseInt(playedAdv.linkedAdvisary.HP),
        Stress : parseInt(playedAdv.linkedAdvisary.Stress),
        ChildId : newId ,
        Name: playedAdv.linkedAdvisary.Name + " " + newId
    }
    playedAdv.advChildren.push(newChild);
    refreshMiddlePane();
}

function createAndAppendPlayedAdvisaryCards(advisaries, containerId) {
    const container = document.getElementById(containerId);    
    if (!container) {
        console.error("Container not found:", containerId);
        return;
    }
    container.innerHTML = ''; // Clear previous content


    advisaries.forEach((playedAdvisary) => {
        advisary = playedAdvisary.linkedAdvisary;
        if (!playedAdvisary["description"]){
            playedAdvisary.description = advisary.Description;
        }
        const card = document.createElement("div");
        card.classList.add("card");
        var tierColor = tierColorTypes[advisary.Tier];
        const movesList = Object.entries(advisary.Features).map(([featureName, feature]) => `<li style = "${actionColorStyles[feature.Type]}"><strong>${featureName}: <i>${feature.Type}</i></strong> ${feature.Description}</li>`).join('');
        
        let experienceHtml = '';
        const experience = advisary.Experience;
        if (experience) {
            experienceHtml += "<p><strong>Experience:</strong>";
            Object.entries(experience).forEach(([expName, expValue]) => {
                experienceHtml += `${expName} ${expValue} `;
            });
            experienceHtml += "</p>";
        }
        var headerHtml = document.createElement("div");

        var headerDiv = document.createElement("div");
        headerDiv.style.backgroundColor = tierColor;
        headerDiv.classList.add("header");

        var headText = document.createElement("p");
        headText.innerHTML=`<strong>${advisary.Name}</strong> - ${advisary.Role}`;
        headerDiv.appendChild(headText);

        var rmvButton = document.createElement("p");
        rmvButton.classList.add("button-text");
        rmvButton.appendChild(document.createTextNode("Remove"));
        rmvButton.onclick = function(){removePlayedAdvisary(playedAdvisary.playId)};
        headerDiv.appendChild(rmvButton);
        
        var addChildButton = document.createElement("p");
        addChildButton.classList.add("button-text");
        addChildButton.appendChild(document.createTextNode("Add Member"));
        addChildButton.onclick = function(){addAdvChildToPlayed(playedAdvisary)};
        headerDiv.appendChild(addChildButton);
        headerHtml.appendChild(headerDiv);

        var footText = document.createElement("p");
        footText.innerHTML=`<strong>Motives & Tactics:</strong><i>${advisary.MotivesTactics}</i>`
        headerHtml.appendChild(footText)

        const cardBody = document.createElement('div');
        cardBody.classList.add("grid-container");
        
        const leftColumnDiv = document.createElement('div');
        leftColumnDiv.classList.add("left-column")
        leftColumnDiv.innerHTML = `
        <p><strong>Tier:</strong> ${advisary.Tier}</p>
        <p><i><strong>${advisary.Weapon.Name}:</strong></i> ${advisary.Weapon.Range}|${advisary.Weapon.Damage}, ${advisary.Weapon.Type}</p>
        <p><strong>Modifier:</strong> ${advisary.Modifier}</p>
        <p><strong>Difficulty:</strong> ${advisary.Difficulty}</p>
        ${experienceHtml}
        `;
        var childrenTb = null;
        if(playedAdvisary["advChildren"]&& Object.keys(playedAdvisary.advChildren).length>0){
            //HP: (1) (1) (12) (33) Stress: 2 (+)(-) (Rmv)
            childrenTb = document.createElement("tbody");
            childrenTb.id = "minionCont";
            playedAdvisary.advChildren.forEach((advChild)=>{
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                const nameDiv = document.createElement("div");
                nameDiv.innerText = advChild.Name;
                nameDiv.classList.add("editable-text");
                nameDiv.contentEditable = true;
                nameDiv.onkeyup = function(){advChild.Name = this.textContent;saveSession();};
                nameCell.appendChild(nameDiv);
            

                const hpCell = document.createElement("td");
                hpCell.classList.add("inline");
                
                hpCell.appendChild(document.createTextNode(`HP:`));
                hpCell.appendChild(generateResource(advChild.HP,playedAdvisary.linkedAdvisary.HP));
                hpCell.classList.add("not-highlight");
                hpCell.onclick = function(){changeAdvHealthOnClick(+1,playedAdvisary.playId,advChild.ChildId)};

                const threshCell = document.createElement("td");
                const threshDiv = generateThresholds(playedAdvisary.linkedAdvisary.Thresholds,playedAdvisary.playId,advChild.ChildId);
                threshDiv.classList.add("inline");
                threshCell.appendChild(threshDiv);

                const stressCell = document.createElement("td");
                stressCell.classList.add("inline");
                stressCell.appendChild(document.createTextNode(`Stress:`));
                stressCell.appendChild(generateResource(advChild.Stress,playedAdvisary.linkedAdvisary.Stress));   
                
                const stressButCell = document.createElement("td");
                stressButDiv = document.createElement("div");
                stressButDiv.classList.add("inline");

                const stressMinusButton = document.createElement("div");
                stressMinusButton.innerText = "-";
                stressMinusButton.classList.add("button-text");
                stressMinusButton.onclick = function(){changeAdvStressOnClick(-1,playedAdvisary.playId,advChild.ChildId)};
                stressButDiv.appendChild(stressMinusButton);

                const stressAddButton = document.createElement("div");
                stressAddButton.innerText = "+";
                stressAddButton.classList.add("button-text");
                stressAddButton.onclick = function(){changeAdvStressOnClick(+1,playedAdvisary.playId,advChild.ChildId)};
                stressButDiv.appendChild(stressAddButton);

                stressButCell.appendChild(stressButDiv);

                const rmvCell = document.createElement("td");
                const rmvDiv = document.createElement("div");
                rmvDiv.classList.add("button-text");
                rmvDiv.onclick = function(){removeAdvChild(playedAdvisary.playId,advChild.ChildId)};
                rmvDiv.innerText = "Remove";
                rmvCell.appendChild(rmvDiv);


                row.appendChild(nameCell);
                row.appendChild(hpCell);
                row.appendChild(threshCell);
                row.appendChild(stressCell);
                row.appendChild(stressButCell);
                row.appendChild(rmvCell);

                childrenTb.appendChild(row);
            });
        }
        else{
            var thresholdsP = document.createElement("p");
            thresholdsP.classList.add("inline")
            const threshLabel = document.createElement("strong");
            threshLabel.innerText = "Thresholds:";
            thresholdsP.appendChild(threshLabel);
            const threshDiv = generateThresholds(playedAdvisary.linkedAdvisary.Thresholds,playedAdvisary.playId)
            threshDiv.classList.add("inline");
            thresholdsP.appendChild(threshDiv);
            leftColumnDiv.appendChild(thresholdsP);
    
            var healthP = document.createElement("p");
            healthP.classList.add("inline");
            const hpLabel = document.createElement("strong");
            hpLabel.innerText = "HP:";
            healthP.appendChild(hpLabel);
            var healthDiv = generateResource(playedAdvisary.health,advisary.HP);
            healthP.appendChild(healthDiv)
    
            const addHealthButton = document.createElement("div");
            addHealthButton.classList.add("button-text");
            addHealthButton.appendChild(document.createTextNode("+1"));
            addHealthButton.onclick = function(){changeAdvHealthOnClick(+1,playedAdvisary.playId)}
            healthP.appendChild(addHealthButton);
    
            const removeHealthButton = document.createElement("div");
            removeHealthButton.classList.add("button-text");
            removeHealthButton.appendChild(document.createTextNode("-1"));
            removeHealthButton.onclick = function(){changeAdvHealthOnClick(-1,playedAdvisary.playId)}
            healthP.appendChild(removeHealthButton);
    
            leftColumnDiv.appendChild(healthP);
    
            if(advisary["Stress"] && advisary.Stress>0){

                var stressP = document.createElement("p");
                stressP.classList.add("inline");
                const stressLabel = document.createElement("strong");
                stressLabel.innerText = "Stress:";
                stressP.appendChild(stressLabel);
                var stressDiv = generateResource(playedAdvisary.stress,advisary.Stress);
                stressP.appendChild(stressDiv)

                leftColumnDiv.appendChild(stressP);
    
                const addStressButton = document.createElement("div");
                addStressButton.classList.add("button-text");
                addStressButton.appendChild(document.createTextNode("+1"));
                addStressButton.onclick = function(){changeAdvStressOnClick(+1,playedAdvisary.playId)}
                stressP.appendChild(addStressButton);

                const removeStressButton = document.createElement("div");
                removeStressButton.classList.add("button-text");
                removeStressButton.appendChild(document.createTextNode("-1"));
                removeStressButton.onclick = function(){changeAdvStressOnClick(-1,playedAdvisary.playId)}
                stressP.appendChild(removeStressButton);
        }
        }
        const rightColumnHtml = `
        <p><strong>Moves:</strong></p>
        <ul>
        ${movesList}
        </ul>
        `;
        // Instead of setting innerHTML directly, append the children elements created
        card.appendChild(headerHtml); // headerHtml is already a DOM element with the event listener attached
        cardBody.appendChild(leftColumnDiv);

        const rightColumnDiv = document.createElement('div');
        rightColumnDiv.classList.add("right-column");
        rightColumnDiv.innerHTML = rightColumnHtml;
        cardBody.appendChild(rightColumnDiv);

        const footerColumnDiv = document.createElement('div');
        if (playedAdvisary["description"]){
            footerColumnDiv.textContent = playedAdvisary.description;
        }
        else {footerColumnDiv.textContent = "Add a description here...";}
        footerColumnDiv.classList.add("editable-text");
        footerColumnDiv.contentEditable = true;
        footerColumnDiv.onkeyup = function(){playedAdvisary.description = this.textContent;saveSession();};
        card.appendChild(cardBody);
        card.appendChild(footerColumnDiv);
        if (playedAdvisary["advChildren"]&& Object.keys(playedAdvisary.advChildren).length>0){
            card.appendChild(childrenTb);
        }

        // Now append the fully assembled card to the container
        container.appendChild(card);
    });
    saveSession();
}

function getPlainCard(advisary){
    const card = document.createElement("div");
    card.classList.add("adv-plain-card");
    card.classList.add("card");
    var tierColor = tierColorTypes[advisary.Tier];
    const movesList = Object.entries(advisary.Features).map(([featureName, feature]) => `<li style = "${actionColorStyles[feature.Type]}"><strong>${featureName}: <i>${feature.Type}</i></strong> ${feature.Description}</li>`).join('');

    let advisaryDescriptionHtml = '';
    if (advisary["Description"]) {
        advisaryDescriptionHtml = `<div class="description-area"><strong>Description:</strong> ${advisary["Description"]}</div>`;
    }
            
    let experienceHtml = '';
    const experience = advisary.Experience;
    if (experience) {
        experienceHtml += "<p><strong>Experience:</strong>";
        Object.entries(experience).forEach(([expName, expValue]) => {
            experienceHtml += `${expName} ${expValue} `;
        });
        experienceHtml += "</p>";
    }
    let headerHtml = `<div onclick="addPlayedAdvisary(${advisary.id})" class="clickable-header" style="background-color:${tierColor};"><strong>${advisary.Name}</strong> - ${advisary.Role}</div>
    <p><strong>Motives & Tactics:</strong><i>${advisary.MotivesTactics}</i></p>
    `;
    
    var threshMj = '';
    var threshSvr = '';
    if (advisary.Thresholds["Major"]){
        threshMj = ` Major: ${advisary.Thresholds.Major}`
    }
    if (advisary.Thresholds["Severe"]){
        threshSvr = ` Severe: ${advisary.Thresholds.Severe}`
    }

    const leftColumnHtml = `
    <div class="left-column">
    <p><strong>Tier:</strong> ${advisary.Tier}</p>
    <p><i><strong>${advisary.Weapon.Name}:</strong></i> ${advisary.Weapon.Range}|${advisary.Weapon.Damage}, ${advisary.Weapon.Type}</p>
    <p><strong>Modifier:</strong> ${advisary.Modifier}</p>
    <p><strong>Difficulty:</strong> ${advisary.Difficulty}</p>
    <p><strong>Thresholds:</strong> Minor: ${advisary.Thresholds.Minor}${threshMj}${threshSvr}</p> 
    ${experienceHtml}
    <p><strong>HP:</strong> ${advisary.HP}</p>
    <p><strong>Stress:</strong> ${advisary.Stress}</p>
    </div>
    `;
    
    const rightColumnHtml = `
    <div class="right-column">
    <p><strong>Moves:</strong></p>
    <ul>
    ${movesList}
    </ul>
    </div>
    `;
    const gridHtml = `<div class="grid-container">${leftColumnHtml}${rightColumnHtml}</div>`
    
    card.innerHTML = headerHtml + gridHtml + advisaryDescriptionHtml;
    return card;
}

function addPlayedAdvisaryNote(advId, note){
    element.contentEditable=true;
    element.className='inEdit';
}

function changeAdvHealthOnClick(amount, advId, instId=-1){
    selectedAdvisaries.forEach(playedAdvisary => {
        if (playedAdvisary.playId == advId){
            if (instId == -1){
                playedAdvisary.health += amount;
                if(playedAdvisary.health<0){
                    playedAdvisary.health = 0;
                }
                else if(playedAdvisary.health > playedAdvisary.linkedAdvisary.HP){
                    playedAdvisary.health = parseInt(playedAdvisary.linkedAdvisary.HP);
                }
            }
            else{
                playedAdvisary.advChildren.forEach(advChild =>{
                    if (advChild.ChildId == instId){
                        advChild.HP += amount;
                        if(advChild.HP<0){
                            advChild.HP = 0;
                        }
                        else if(advChild.HP > playedAdvisary.linkedAdvisary.HP){
                            advChild.HP = parseInt(playedAdvisary.linkedAdvisary.HP);
                        }
                    }
                });
            }
        }
    });
    refreshMiddlePane();
}
function changeAdvStressOnClick(amount, advId, instId=-1){
    selectedAdvisaries.forEach(playedAdvisary => {
        if (playedAdvisary.playId == advId){
            if (instId == -1){
                playedAdvisary.stress += amount;
                if(playedAdvisary.stress<0){
                    playedAdvisary.stress = 0;
                }
                else if(playedAdvisary.stress > playedAdvisary.linkedAdvisary.Stress){
                    playedAdvisary.stress = parseInt(playedAdvisary.linkedAdvisary.Stress);
                }
            }
            else{
                playedAdvisary.advChildren.forEach(advChild =>{
                    if (advChild.ChildId == instId){
                        advChild.Stress += amount;
                        if(advChild.Stress<0){
                            advChild.Stress = 0;
                        }
                        else if(advChild.Stress > playedAdvisary.linkedAdvisary.Stress){
                            advChild.Stress = parseInt(playedAdvisary.linkedAdvisary.Stress);
                        }
                    }
                });
            }
        }
    });
    refreshMiddlePane();
}

function removePlayedAdvisary(advId){
    selectedAdvisaries = selectedAdvisaries.filter(playedAdvisary => playedAdvisary.playId !== advId);
    refreshMiddlePane();
}

function addPlayedAdvisary(advisary){
    if(isInt(advisary)){
        var matchId = advisary;
        for (item of advisaryMasterList){
            if (item.id == matchId){
                advisary=item;
            }
        }
    }

    var playedAdvisary = {};
    playedAdvisary.linkedAdvisary = advisary 
    playedAdvisary.health = parseInt(advisary.HP);
    playedAdvisary.stress = parseInt(advisary.Stress);
    playedAdvisary.playId = LatestPlayId;
    playedAdvisary.advChildren = [];
    LatestPlayId++;
    selectedAdvisaries.push(playedAdvisary);
    refreshMiddlePane();
}

function displayAdvisaries(advisaries) {
    
    if (advisaries.length === 0) {
        console.log("No advisaries to display.");
        return; // Exit the function early
    }
    
    createAndAppendAdvisaryCards(advisaries, "selected-advisaries-container");
}
function displayPlayedAdvisaries(advisaries) {
    
    if (advisaries.length === 0) {
        console.log("No advisaries to display.");    
        const container = document.getElementById("selected-advisaries-container");
        container.innerHTML = '';
        saveSession();
        return; // Exit the function early
    }
    
    createAndAppendPlayedAdvisaryCards(advisaries, "selected-advisaries-container");
}

function addNewCustomAdvisary(){
    window.open("advisaryMaker.html");
}

function sortBySelected(filteredList,advisaryValueToSortBy,previoslySelected,currentDirection){
    var direction = true;
    if(advisaryValueToSortBy != "Name" && advisaryValueToSortBy != "Role"){
        if (previoslySelected == advisaryValueToSortBy&&currentDirection){
            searchList = filteredList.sort((a,b) => parseInt(b[advisaryValueToSortBy])-parseInt(a[advisaryValueToSortBy]));//desc
        }
        else{
            searchList = filteredList.sort((a,b) => parseInt(a[advisaryValueToSortBy])-parseInt(b[advisaryValueToSortBy]));//asc
        }
        direction = !currentDirection;
    }else{
        if (previoslySelected == advisaryValueToSortBy&&currentDirection){
            searchList = filteredList.sort((a,b) => {
                if (a[advisaryValueToSortBy] < b[advisaryValueToSortBy]) {
                    return 1;
                  }
                  if (a[advisaryValueToSortBy] > b[advisaryValueToSortBy]) {
                    return -1;
                  }
                  return 0;
            });//desc
            direction = !currentDirection;
        }
        else{
            searchList = filteredList.sort((a,b) => {                
                if (a[advisaryValueToSortBy] < b[advisaryValueToSortBy]) {
                    return -1;
                  }
                  if (a[advisaryValueToSortBy] > b[advisaryValueToSortBy]) {
                    return 1;
                  }
                  return 0;
            });//asc
        }
    }
    displayAdvisaryShortList(searchList, advisaryValueToSortBy,direction);
}

function displayAdvisaryShortList(advisaries, selectedSort = -1,direction=null)//direction, true asc false desc
{
    const listContainer = document.getElementById("advisaries-list-container");
    listContainer.innerHTML = ""; // Clear the container

    // Create the table and the table body
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    const headRow = document.createElement("tr");
    headRow.classList.add("table-head-row");

    const addHeadCell = document.createElement("td");
    addHeadCell.textContent = `Add`;
    headRow.appendChild(addHeadCell);

    // Create the name and tier cell
    const nameHeadCell = document.createElement("td");
    nameHeadCell.textContent = `Name`;
    nameHeadCell.id = "Name";
    nameHeadCell.onclick = function(){sortBySelected(advisaries,"Name",selectedSort,direction);};
    headRow.appendChild(nameHeadCell);

    const tierHeadCell = document.createElement("td");
    tierHeadCell.textContent = `Tier`;
    tierHeadCell.id = "Tier";
    tierHeadCell.onclick = function(){sortBySelected(advisaries,"Tier",selectedSort,direction);};
    headRow.appendChild(tierHeadCell);

    const diffHeadCell = document.createElement("td");
    diffHeadCell.textContent = `DC`;
    diffHeadCell.id = "Difficulty";
    diffHeadCell.onclick = function(){sortBySelected(advisaries,"Difficulty",selectedSort,direction);};
    headRow.appendChild(diffHeadCell);

    
    const roleHeadCell = document.createElement("td");
    roleHeadCell.textContent = `Role`;
    roleHeadCell.id = "Role";
    roleHeadCell.onclick = function(){sortBySelected(advisaries,"Role",selectedSort,direction);};
    headRow.appendChild(roleHeadCell);

    for (var c = 0, cell; cell = headRow.cells[c]; c++) {
        if(cell.id == selectedSort){
            if(direction){
                cell.style = "border-style: solid hidden hidden hidden;border-width: 2px;border-color: red;"
            }
        else{
            cell.style = "border-style: hidden hidden solid hidden;border-width: 2px;border-color: red;"
            }
        }
    } 
    // Append the row to the table body
    tbody.appendChild(headRow);

    advisaries.forEach((advisary) => {
        // Create a row for each advisary
        const row = document.createElement("tr");

        // Create the add cell
        const addCell = document.createElement("td");
        const addButton = document.createElement("div");
        addButton.classList.add("button-text");
        addButton.appendChild(document.createTextNode("+"));
        addButton.onclick = function(){addPlayedAdvisary(advisary)};

        addCell.appendChild(addButton);
        row.appendChild(addCell);

        // Create the name and tier cell
        const nameCell = document.createElement("td");
        nameCell.textContent = `${advisary.Name}`;
        row.appendChild(nameCell);

        const tierCell = document.createElement("td");
        tierCell.textContent = `${advisary.Tier}`;
        row.appendChild(tierCell);

        const diffCell = document.createElement("td");
        diffCell.textContent = `${advisary.Difficulty}`;
        row.appendChild(diffCell);

        
        const roleCell = document.createElement("td");
        roleCell.textContent = `${advisary.Role}`;
        row.appendChild(roleCell);

        // Append the row to the table body
        tbody.appendChild(row);
    });

    // Append the tbody to the table, and the table to the listContainer
    table.appendChild(tbody);
    listContainer.appendChild(table);
}
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredAdvisaries = advisaryMasterList.filter(advisary => advisary.Name.toLowerCase().includes(searchTerm) || advisary.Role.toLowerCase().includes(searchTerm));
        const leftContainer = document.getElementById("advisaries-container");
        leftContainer.innerHTML = ''; // Clear previous content
        
        //displayAdvisaries(advisaryMasterList,"advisaries-container");
        displayAdvisaryShortList(filteredAdvisaries); // Call to display simplified list based on search
    });
}

function setupGMControls(){
    const controlsContainer = document.getElementById("gm-controls");
    controlsContainer.innerHTML = "";

    const controlsHeader = document.createElement("p");
    controlsHeader.classList.add("controls-header");
    controlsHeader.textContent = "GM Controls";
    controlsContainer.appendChild(controlsHeader);
    const maxFear = 6;
    //fear counter
    const fearP = document.createElement("p");
    fearP.classList.add("inline-center");
    const fearLabel = document.createElement("div");
    fearLabel.textContent = "Fear: ";
    fearP.appendChild(fearLabel);
    const fearHolder = document.createElement("div");
    fearHolder.classList.add("inline-center");
    fearHolder.classList.add("fear-holder");
    //button to add/remove
    for(let i = 0; i<GMControlState.fear;i++){
        const fearBubble = document.createElement("div");
        fearBubble.classList.add("button-fear");
        fearBubble.textContent = i+1;
        fearBubble.onclick = function(){setFear(i+1,maxFear)};
        fearHolder.appendChild(fearBubble);
    }
    for(let i = GMControlState.fear; i<maxFear;i++){
        const fearBubble = document.createElement("div");
        fearBubble.classList.add("button-fear");
        fearBubble.classList.add("button-fear-grayed");
        fearBubble.onclick = function(){setFear(i+1,maxFear)};
        fearHolder.appendChild(fearBubble);
    }
    
    fearP.appendChild(fearHolder);
    controlsContainer.appendChild(fearP)

    const fearButtonsP = document.createElement("p");
    fearButtonsP.classList.add("inline-center");

    const removeFearButton = document.createElement("div");
    removeFearButton.classList.add("button-text");
    removeFearButton.textContent = "-1 FT"
    removeFearButton.onclick = function(){addFear(-1,maxFear)};
    fearButtonsP.appendChild(removeFearButton);  

    const addFearButton = document.createElement("div");
    addFearButton.classList.add("button-text");
    addFearButton.textContent = "+1 FT"
    addFearButton.onclick = function(){addFear(1,maxFear)};
    fearButtonsP.appendChild(addFearButton);  

    //Button to convert 2 fear to 1 action token
    const convertButton = document.createElement("div");
    convertButton.classList.add("button-text");
    convertButton.textContent = "1 FT-> 2 AT";
    convertButton.onclick = function(){addFear(-1,maxFear);addAction(+2);};
    fearButtonsP.appendChild(convertButton);  
    
    controlsContainer.appendChild(fearButtonsP);

    //action token
    const actionsP = document.createElement("p");
    actionsP.textContent = "Action Tracker at :"+GMControlState.actions;
    actionsP.classList.add("inline-center");
    for(let i = 0; i<GMControlState.actions;i++){
        const actionBubble = document.createElement("div");
        actionBubble.classList.add("action-token");
        actionsP.appendChild(actionBubble);
    }
    const actionButtonsP = document.createElement("p");
    actionButtonsP.classList.add("inline-center");

    const removeActionsButton = document.createElement("div");
    removeActionsButton.classList.add("button-text");
    removeActionsButton.textContent = "-1 AT"
    removeActionsButton.onclick = function(){addAction(-1)};
    actionButtonsP.appendChild(removeActionsButton);  

    const addActionsButton = document.createElement("div");
    addActionsButton.classList.add("button-text");
    addActionsButton.textContent = "+1 AT"
    addActionsButton.onclick = function(){addAction(1)};
    actionButtonsP.appendChild(addActionsButton);  

    //Button to convert 2 fear to 1 action token
    const convertActionsButton = document.createElement("div");
    convertActionsButton.classList.add("button-text");
    convertActionsButton.textContent = "2 AT->1 FT";
    convertActionsButton.onclick = function(){if(GMControlState.actions>1 && (GMControlState.fear+1)<maxFear){addFear(+1,maxFear);addAction(-2);}};
    actionButtonsP.appendChild(convertActionsButton);  
    
    controlsContainer.appendChild(actionButtonsP);

    controlsContainer.appendChild(actionsP);

    const macroActions = document.createElement("p");
    macroActions.classList.add("inline-center");

    const playerAction = document.createElement("div");
    playerAction.classList.add("button-text");
    playerAction.textContent = "Add Token ";
    playerAction.onclick = function(){addAction(+1);};
    macroActions.appendChild(playerAction)

    const convertAllActionsButton = document.createElement("div");
    convertAllActionsButton.classList.add("button-text");
    var potentialFear = Math.floor(GMControlState.actions/2);
    if(potentialFear+GMControlState.fear > maxFear){
        potentialFear = maxFear - GMControlState.fear;
    }
    convertAllActionsButton.textContent = ""+potentialFear*2+" AT->"+potentialFear+" FT";
    convertAllActionsButton.onclick = function(){
        addAction(-(potentialFear*2));
        addFear(potentialFear);
    };
    macroActions.appendChild(convertAllActionsButton)
    controlsContainer.appendChild(macroActions);
    
    saveSession();
}

function generateLoops(){
    const loopDiv = document.getElementById("loops");
    loopDiv.innerHTML ='';

    const loopTable = document.createElement("table");
    loopTable.style = "width:350px;";
    const loopTbody = document.createElement("tbody");
    loopTbody.id = "ctdnTableBody";
    const headerRow = document.createElement("tr");

    const headCount = document.createElement("td");
    headCount.innerHTML = "<b>Count</b>";
    const headName = document.createElement("td");
    headName.innerHTML = "<b>Name</b>";
    const headTrigger = document.createElement("td");
    headTrigger.innerHTML = "<b>Trigger</b>";
    const headType = document.createElement("td");
    headType.innerHTML = "<b>Type</b>";
    const headButtons = document.createElement("td");
    headButtons.innerHTML = "<b>Buttons</b>";
    headerRow.appendChild(headCount);
    headerRow.appendChild(headName);
    headerRow.appendChild(headType);
    headerRow.appendChild(headTrigger);
    headerRow.appendChild(headButtons);

    loopTbody.appendChild(headerRow);

    loops.forEach(loop => {
        var index = loops.indexOf(loop);
        const loopRow = document.createElement("tr");
        
        const loopCount = document.createElement("td");
        loopCount.innerText = loop.Current+"/"+loop.Max;

        const loopName = document.createElement("td");
        loopName.innerText = loop.Name;

        const loopType = document.createElement("td");
        loopType.innerText = loop.Type;

        const loopTrigger = document.createElement("td");
        const loopTriggerButton = document.createElement("div");
        loopTriggerButton.classList.add("button-text");
        loopTriggerButton.innerText = loop.Trigger;
        loopTriggerButton.id = loop.Trigger;
        loopTriggerButton.onmouseover = function(){
            var buttons = document.querySelectorAll('[id='+loop.Trigger+']');
            buttons.forEach(but =>{
                but.classList.add('hover');
                but.style = "color:white;background-color: #696969;"
            });
            console.log(buttons);
        }
        loopTriggerButton.onmouseleave = function(){
            var buttons = document.querySelectorAll('[id='+loop.Trigger+']');
            buttons.forEach(but =>{
                but.style = ""
            });
            console.log(buttons);
        }
        loopTriggerButton.onclick = function(){
            loops.forEach(l =>{
                if(l.Trigger == loop.Trigger){
                    triggerCountdown(loops.indexOf(l));
                }
            });
            generateLoops();
        }
        loopTrigger.appendChild(loopTriggerButton);

        const loopButtons = document.createElement("td");
        const deleteButton = document.createElement("div");
        deleteButton.classList.add("button-text");
        deleteButton.onclick = function(){
            loops.splice(index,1);
            generateLoops();
        }
        deleteButton.innerText = "Delete";
        loopButtons.appendChild(deleteButton);

        loopRow.appendChild(loopCount);
        loopRow.appendChild(loopName);
        loopRow.appendChild(loopType);
        loopRow.appendChild(loopTrigger);

        loopRow.appendChild(loopButtons);
        
        if (loop.JustTriggered){
            loopRow.id = "triggered-loop-row";
        }

        loopTbody.appendChild(loopRow);

    });
    //addition row
    const loopRow = document.createElement("tr");
    
    const loopCount = document.createElement("td");
    const countField = document.createElement("input");
    countField.type = "number";
    countField.style = "width:40px;"
    loopCount.appendChild(countField);

    const loopName = document.createElement("td");
    const nameField = document.createElement("input");
    nameField.type = "text";
    nameField.style = "width:70px;"
    loopName.appendChild(nameField);

    const type = document.createElement("td");
    const typeField = document.createElement("select");
    typeField.innerHTML = `<option value="Loop">Loop</option><option value="Countdown">Countdown</option>`
    typeField.style = "width:70px;"
    type.appendChild(typeField)

    
    const loopTrigger = document.createElement("td");
    const triggerField = document.createElement("input");
    triggerField.type = "text";
    triggerField.style = "width:70px;"
    loopTrigger.appendChild(triggerField);


    const loopButtons = document.createElement("td");
    const addButton = document.createElement("div");
    addButton.classList.add("button-text");
    addButton.onclick = function(){
        loops.push({
            "Name":nameField.value,
            "Max":parseInt(countField.value),
            "Current":parseInt(countField.value),
            "Type":typeField.value,
            "Trigger":triggerField.value,
            "JustTriggered":false
        });
        generateLoops();
    }
    addButton.innerText = "add";
    loopButtons.appendChild(addButton);

    loopRow.appendChild(loopCount);
    loopRow.appendChild(loopName);
    loopRow.appendChild(type);
    loopRow.appendChild(loopTrigger);
    loopRow.appendChild(loopButtons);
    loopTbody.appendChild(loopRow);

    loopTable.appendChild(loopTbody);
    loopDiv.appendChild(loopTable);
    
    
    saveSession();
}

function triggerCountdown(index){
    loops[index].Current += -1;
    if (loops[index].Current < 1){
        if(loops[index].Type == "Loop"){
            loops[index].Current = loops[index].Max;
            loops[index].JustTriggered = true;
        }else if(loops[index].JustTriggered == true){
            loops.splice(index,1);
        }else if(loops[index].JustTriggered == false){
            loops[index].JustTriggered = true;
        }
    }else{
        loops[index].JustTriggered = false;
    }
}

function addAction(value){
    GMControlState.actions += value;
    if (GMControlState.actions < 0){
        GMControlState.actions = 0;
    }
    setupGMControls();
}
function addFear(value, max){
    GMControlState.fear += value;
    fearCheck(max);
    setupGMControls();
}
function setFear(value, max){
    GMControlState.fear = value
    fearCheck(max);
    setupGMControls();
}

function fearCheck(max){
    if(GMControlState.fear > max){
        GMControlState.fear = max;
    }
    else if (GMControlState.fear < 0){
        GMControlState.fear = 0;
    }
}
