var experiences = [];
var features = [];
const featureTypes = [
    "Action",
    "Action (2)",
    "Action (3)",
    "Reaction",
    "Passive",
]
const featurePresets = [
    {
        "Name":"Relentless (X)",
        "Type":"Passive",
        "Description":"This adversary can activate up to X times during a GM move, so long as there are enough action tokens. You still spend an action token each time you activate them in this way."
    },
    {
        "Name":"Slow (X)",
        "Type":"Passive",
        "Description":"This adversary costs X action tokens to activate, instead of just one token."
    },
    {
        "Name":"Minion (X)",
        "Type":"Passive",
        "Description":"For every X damage a PC deals to this adversary, an additional minion within the attack’s range is defeated."
    },
    {
        "Name":"Horde (X)",
        "Type":"Passive",
        "Description":"If the horde has marked at least half of their Hit Points, their attack only deals X damage."
    },
    {
        "Name":"Magic Resistance",
        "Type":"Passive",
        "Description":"This adversary is resistant to magic damage."
    },
    {
        "Name":"Armor",
        "Type":"Passive",
        "Description":"When this adversary takes physical damage, reduce that damage by X."
    }
    
]
const defultAdvisary={
    "Name": "",
    "Description": "",
    "MotivesTactics": "",
    "Tier": "",
    "Role": "",
    "id": 0,
    "Difficulty": "",
    "Modifier": "",
    "Weapon": {
    },
    "Thresholds": {
    },
    "HP": "",
    "Stress": "",
    "Experience": {
    },
    "Features": {
    }
}
let vanillaAdvisaries = [];
let customAdvisaries = [];
var advisaryObject = {
    "Name": "",
    "Description": "",
    "MotivesTactics": "",
    "Tier": "",
    "Role": "",
    "id": -1,
    "Difficulty": "",
    "Modifier": "",
    "Weapon": {
    },
    "Thresholds": {
    },
    "HP": "",
    "Stress": "",
    "Experience": {
    },
    "Features": {
    }
}
/*

Armored Carapace - Passive

When this adversary takes physical damage, reduce that damage by X.
*/

document.addEventListener("DOMContentLoaded", function() {
    setupSession();
    loadAdvisary(advisaryObject.id);
    generateFeaturePresetList();   
    updateCustomAdvisariesDisplay();
    updateUIFromJson();
    updateCreationJson();
});

function setupSession(){
    customAdvisaries = loadJsonArrayFromLocalStorage('customAdvisary');
    vanillaAdvisaries = loadJsonArrayFromLocalStorage('advisaryVanilla');
    advisaryObject.id = loadJsonFromLocalStorage("newAdvisaryId");
}

function loadAdvisary(advisaryId){
    customAdvisaries.forEach(adv => {
        if(adv.id == advisaryId){
            advisaryObject = adv
        }
    })
}

function saveCreation(){
    //check if in session
    var found = false;
    customAdvisaries.forEach(advisary => {
        if (advisary.id == advisaryObject.id){
            found = true;
            customAdvisaries[customAdvisaries.indexOf(advisary)] = advisaryObject;
        }
    });
    //add if not
    if (found == false){
        customAdvisaries.push(advisaryObject);
    }
    saveJsonToLocalStorage('customAdvisary',customAdvisaries);
    updateCustomAdvisariesDisplay();
}

function newAdvisary(){
    //getID
    var usedIds = [];
    var newId = 1;
    const advisaryMasterList = [...vanillaAdvisaries,...customAdvisaries];
    advisaryMasterList.forEach(advisary => {usedIds.push(advisary.id);});
    while(usedIds.includes(newId)){
        newId++
    }
    saveJsonToLocalStorage("newAdvisaryId",newId);
    advisaryObject = JSON.parse(JSON.stringify(defultAdvisary));
    advisaryObject.id = newId;
    //Load New
    emptyUIFields();
    saveCreation();
    updateCustomAdvisariesDisplay();
    updateUIFromJson();
}

function updateCreationJson(){
    advisaryObject.Name = document.getElementById("name").value;
    advisaryObject.MotivesTactics = document.getElementById("motives").value;
    advisaryObject.Tier = document.getElementById("tier").value;
    advisaryObject.Role = document.getElementById("role").value;
    advisaryObject.Difficulty = document.getElementById("difficulty").value;
    advisaryObject.Modifier = document.getElementById("modifier").value;
    advisaryObject.HP = document.getElementById("hp").value;
    advisaryObject.Stress = document.getElementById("stress").value;
    advisaryObject.Thresholds.Minor = document.getElementById("minorThresh").value;
    advisaryObject.Thresholds.Major = document.getElementById("majorThresh").value;
    advisaryObject.Thresholds.Severe = document.getElementById("severeThresh").value;
    advisaryObject.Weapon.Damage = document.getElementById("weaponDamage").value;
    advisaryObject.Weapon.Name = document.getElementById("weaponName").value
    advisaryObject.Weapon.Range = document.getElementById("weaponRange").value;
    advisaryObject.Weapon.Type =document.getElementById("damageType").value;
    advisaryObject.Experience = {};//empty exps
    experiences.forEach(experience =>{
        advisaryObject.Experience[experience.name] = experience.bonus;
    })
    advisaryObject.Features = {};
    features.forEach(feature=>{
        const newFeat = {
            "Type":feature.Type,
            "Description":feature.Description
        }
        advisaryObject.Features[feature.Name] = newFeat;
    });
    updateJSonField();
    saveCreation();
}
function emptyUIFields(){
    document.getElementById("name").value='';
    document.getElementById("motives").value='';
    document.getElementById("tier").value='';
    document.getElementById("role").value='';
    document.getElementById("difficulty").value='';
    document.getElementById("modifier").value = '';
    document.getElementById("hp").value = '';
    document.getElementById("stress").value = '';
    document.getElementById("minorThresh").value = '';
    document.getElementById("majorThresh").value = '';
    document.getElementById("severeThresh").value = '';
    document.getElementById("weaponName").value = '';
    document.getElementById("weaponRange").value = '';
    document.getElementById("damageType").value = '';
    document.getElementById("weaponDamage").value = '';
    experiences =[];
    features = [];
    regenerateFeatureList();
    regenerateExperienceDiv();
    updateJSonField();
}
function updateUIFromJson(){
    emptyUIFields();
    document.getElementById("name").value=advisaryObject.Name;
    document.getElementById("motives").value=advisaryObject.MotivesTactics;
    document.getElementById("tier").value=advisaryObject.Tier;
    document.getElementById("role").value=advisaryObject.Role;
    document.getElementById("difficulty").value=advisaryObject.Difficulty;
    document.getElementById("modifier").value = advisaryObject.Modifier;
    document.getElementById("hp").value = advisaryObject.HP;
    document.getElementById("stress").value = advisaryObject.Stress;
    document.getElementById("minorThresh").value = advisaryObject.Thresholds.Minor;
    document.getElementById("majorThresh").value = advisaryObject.Thresholds.Major;
    document.getElementById("severeThresh").value = advisaryObject.Thresholds.Severe;
    document.getElementById("weaponName").value = advisaryObject.Weapon.Name;
    document.getElementById("weaponRange").value = advisaryObject.Weapon.Range;
    document.getElementById("damageType").value = advisaryObject.Weapon.Type;
    document.getElementById("weaponDamage").value = advisaryObject.Weapon.Damage;
    experiences =[];
    Object.entries(advisaryObject.Experience).forEach(([expName, expValue]) => {
        experiences.push({
            "name":expName,
            "bonus":expValue
        });
    });
    features = [];
    Object.entries(advisaryObject.Features).forEach(([featName, featValue]) => {
        features.push({
            "Name":featName,
            "Type":featValue.Type,
            "Description":featValue.Description
        });
    });
    regenerateFeatureList();
    regenerateExperienceDiv();
    updateJSonField();
}

function deleteAdvisary(id){
    customAdvisaries.forEach(adv => {
        if(adv.id == id){
            customAdvisaries.splice(customAdvisaries.indexOf(adv),1);
        }
    });
    saveJsonToLocalStorage('customAdvisary',customAdvisaries);
    updateCustomAdvisariesDisplay();
}

function loadAdvisaryForEdit(id){
    saveJsonToLocalStorage('newAdvisaryId',id);
    setupSession();
    loadAdvisary(advisaryObject.id);
    updateUIFromJson();
    updateCreationJson();
}



function updateCustomAdvisariesDisplay(){
    const listContainer = document.getElementById("advisaries-list-container");
    listContainer.innerHTML = ""; // Clear the container

    // Create the table and the table body
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    const headRow = document.createElement("tr");

    const addHeadCell = document.createElement("td");
    addHeadCell.textContent = `Edit`;
    headRow.appendChild(addHeadCell);

    const deleteHeadCell = document.createElement("td");
    deleteHeadCell.textContent = `Delete`;
    headRow.appendChild(deleteHeadCell);

    // Create the name and tier cell
    const nameHeadCell = document.createElement("td");
    nameHeadCell.textContent = `Name`;
    nameHeadCell.onclick = function(){sortBySelected("Name",selectedSort);};
    headRow.appendChild(nameHeadCell);

    const tierHeadCell = document.createElement("td");
    tierHeadCell.textContent = `Tier`;
    headRow.appendChild(tierHeadCell);

    const diffHeadCell = document.createElement("td");
    diffHeadCell.textContent = `DC`;
    headRow.appendChild(diffHeadCell);

    
    const roleHeadCell = document.createElement("td");
    roleHeadCell.textContent = `Role`;
    headRow.appendChild(roleHeadCell);


    // Append the row to the table body
    tbody.appendChild(headRow);

    customAdvisaries.forEach((advisary) => {
        // Create a row for each advisary
        const row = document.createElement("tr");

        // Create the add cell
        const editCell = document.createElement("td");
        const editButton = document.createElement("div");
        editButton.classList.add("button-text");
        editButton.appendChild(document.createTextNode("edit"));
        editButton.onclick = function(){loadAdvisaryForEdit(advisary.id)};
        editCell.appendChild(editButton);
        row.appendChild(editCell);
        
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("div");
        deleteButton.classList.add("button-text");
        deleteButton.appendChild(document.createTextNode("delete"));
        deleteButton.onclick = function(){deleteAdvisary(advisary.id)};
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

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

function diceString(){
    var result = "";
    var diceCount = document.getElementById("weaponDiceCount").value;
    var dice = document.getElementById("weaponDice").value;
    var bonus = document.getElementById("weaponDamageBonus").value;
    if (diceCount == 0){
        result += 1;
    }
    else{
        result +=diceCount;
    }
    result += dice;
    if(bonus<0){
        result += "-"+bonus;
    }
    else if (bonus>0){
        result += "+"+bonus;
    }
    return result;
}
function updateJSonField(){
    const div = document.getElementById("jsonArea");
    var jString = JSON.stringify(advisaryObject);
    var stringArr = jString.split('{');
    stringArr.splice(0,1);
    var stringHtml = "";
    stringArr.forEach(line =>{
        var newLine = "{";
        if (stringHtml != ""){
            newLine += "</br>"
        }
        if ((line.includes('"Description":')&&!line.includes('"MotivesTactics":""'))||line.length==1){
            newLine+=line;
        }
        else{
            var lineArr = line.split(',');
            lineArr.forEach(x =>{
                if (lineArr.indexOf(x)==0){
                    newLine+=x;
                }
                else{
                    newLine+=',</br>'+x;
                }
            });
        }
        stringHtml += newLine;
    })

    div.innerHTML = stringHtml;
}
function generateFeaturePresetList(){
    const presetSelect = document.getElementById("presets");
    const presetItemOne = document.createElement("option");
    presetItemOne.value = "default";
    presetItemOne.text = "select preset";
    presetSelect.appendChild(presetItemOne);

    featurePresets.forEach(preset =>{
        const newOption = document.createElement("option");
        newOption.value = preset.Name;
        newOption.text = preset.Name;
        presetSelect.appendChild(newOption);
    });

    presetSelect.onchange = function(){presetSelected();};
}

function presetSelected(){
    const presetSelect = document.getElementById("presets");
    if (presetSelect.value == "default"){
        return;
    }
    const selectedFeature = featurePresets.find((x=>x.Name==presetSelect.value));
    addPresetFeature(selectedFeature);
    presetSelect.value = "default";
}

function newFeature(){
    console.log("adding new feature");
    features.push({
        "Name":"New Feature",
        "Type":"Action",
        "Description":"Description"
    });
    regenerateFeatureList();
}
function addPresetFeature(preset){
    console.log("adding preset feature "+preset.Name);
    features.push({
        "Name":preset.Name,
        "Type":preset.Type,
        "Description":preset.Description
    });
    regenerateFeatureList();
}

function regenerateFeatureList(){
    const featureDiv = document.getElementById("features-div");
    featureDiv.textContent = '';
    features.forEach(feature => {
        featureDiv.appendChild(regenerateFeatureField(feature));
    });
}

function regenerateFeatureField(feature){
    const newfeatureDiv = document.createElement("div");

    const headerDiv = document.createElement("div");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = feature.Name;
    nameInput.onchange = function(){feature.Name = this.value;};

    headerDiv.appendChild(nameInput);
    headerDiv.classList.add("inline");

    const typeSelector = document.createElement("select");
    featureTypes.forEach(type=>{
        const newType = document.createElement("option")
        newType.value = type;
        newType.text = type;
        typeSelector.appendChild(newType);
    });
    typeSelector.value = feature.Type;
    
    typeSelector.onchange = function(){feature.Type = this.value;};
    headerDiv.appendChild(typeSelector);

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("button-text");
    deleteButton.style = "width: 40px;";
    deleteButton.innerText = "Delete"
    deleteButton.onclick = function(){features.splice(features.indexOf(feature),1);regenerateFeatureList();};
    headerDiv.appendChild(deleteButton);

    
    const descDiv =  document.createElement("textarea");
    descDiv.style = "width: 500px;"
    descDiv.innerText = feature.Description;
    descDiv.onchange = function(){feature.Description = this.value;};

    newfeatureDiv.appendChild(headerDiv);
    newfeatureDiv.appendChild(descDiv);

    return newfeatureDiv;
}

function newExperience(){
    console.log("adding new experience");
    var newExpId = Object.keys(experiences).length;
    experiences.push({
        "name":"NewExp "+newExpId,
        "bonus":"1"});
    regenerateExperienceDiv();
}
function regenerateExperienceDiv(){
    const experienceDiv = document.getElementById("experiences-div");
    experienceDiv.textContent = '';
    experiences.forEach(experience => {
        experienceDiv.appendChild(generateExperienceField(experience));
    });
}
function parseBonus(bonusInt){
    if(bonusInt>0){
        return "+"+bonusInt;
    }
    return bonusInt.toString();
}
function generateExperienceField(experience){
    const newExperienceDiv = document.createElement("div");
    newExperienceDiv.classList.add("inline");

    const experienceName = document.createElement("input");
    experienceName.type = "text";
    experienceName.value = experience.name;
    experienceName.onkeyup = function(){experience.name = experienceName.value;};

    const bonus = document.createElement("input");
    bonus.type ="number";
    bonus.style = "width: 30px;";
    bonus.value = parseInt(experience.bonus);
    bonus.min = 1;
    bonus.onchange = function(){experience.bonus = parseBonus(bonus.value);};

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("button-text");
    deleteButton.style = "width: 40px;";
    deleteButton.innerText = "Delete"
    deleteButton.onclick = function(){experiences.splice(experiences.indexOf(experience),1);regenerateExperienceDiv();};

    newExperienceDiv.appendChild(experienceName);
    newExperienceDiv.appendChild(bonus);
    newExperienceDiv.appendChild(deleteButton);
    return newExperienceDiv;
}

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