document.addEventListener("DOMContentLoaded", () => {
    // alert("yo!");
    // localStorage.clear();

    // TODO Refactor this
    for (let [key, value] of Object.entries(localStorage)) {
        switch (value) {
            case "Planet":
                document.getElementById(key.toLowerCase()).checked = true;
                numSelectedSystems++
                break;
            default:
                break;
        }
    }


    loadVariantSettings();
    updateNumberOfSelectedSystems();
    setupBuildQueue();
})

// const planetnames = ["Coruscant", "Rebel Base", "Alderaan", "Bespin", "Bothawui", "Cato Neimoidia",
//     "Corellia", "Felucia", "Geonosis", "Kashyyyk", "Kessel", "Malastare", "Mandalore",
//     "Mon Calamari", "Mustafar", "Mygeeto", "Naboo", "Nal Hutta", "Ord Mantell",
//     "Rodia", "Ryloth", "Saleucami", "Sullust", "Toydaria", "Utapau"];

// const planetnames = ["Coruscant", "Rebel Base",
//     "Felucia", "Mon Calamari", "Saleucami",
//     "Mygeeto", "Ord Mantell",
//     "Kashyyyk", "Malastare", "Mandalore",
//     "Alderaan", "Cato Neimoidia", "Corellia",
//     "Bothawui", "Kessel", "Nal Hutta", "Toydaria",
//     "Geonosis", "Rodia", "Ryloth",
//     "Naboo", "Sullust", "Utapau",
//     "Bespin", "Mustafar"];

const planetnames = [["Coruscant", "Rebel Base"],
["Felucia", "Mon Calamari", "Saleucami"],
["Mygeeto", "Ord Mantell"],
["Kashyyyk", "Malastare", "Mandalore"],
["Alderaan", "Cato Neimoidia", "Corellia"],
["Bothawui", "Kessel", "Nal Hutta", "Toydaria"],
["Geonosis", "Rodia", "Ryloth"],
["Naboo", "Sullust", "Utapau"],
["Bespin", "Mustafar"]];

function setupBuildQueue() {
    planetnames.forEach(system => {
        system.forEach(planet => {
            cloneNodeAndChangeId('buildtemplate', planet, system.indexOf(planet));
            changePlanetDisplayName(planet);
            changeRadioGroupName(planet);
        })
    })

    moveBuildButton();

    setDefaultBuildOptions('Coruscant', 'radioempire');
    setDefaultBuildOptions('Rebel Base', 'radiorebel');

    hideBuildTemplate();

    loadBuildQueueSettings();
}

function loadBuildQueueSettings() {
    GetSettingsByValue("buildchk").forEach(planet => {
        let planetName = planet.split(",")[0];
        let chkName = planet.split(",")[1];
        let checks = document.getElementById(planetName).getElementsByClassName('form-check-input');
        for (let index = 0; index < checks.length; index++) {
            if (checks[index].id === chkName) { checks[index].checked = true; };
        }
    })
}

function cloneNodeAndChangeId(nodename, planetname, rowCount) {
    let clonenode = document.getElementById(nodename).cloneNode(true);
    clonenode.id = planetname;

    if (rowCount == 0) {
        // add border to the top
        clonenode.classList.add('builditemstart');
    }

    document.getElementById('buildqueue').appendChild(clonenode);
}

function changePlanetDisplayName(planetname) {
    let elements = document.getElementById(planetname).getElementsByClassName('col-3');
    for (let index = 0; index < elements.length; index++) {
        elements[index].firstElementChild.innerText = planetname;
    }
}

function changeRadioGroupName(planetname) {
    let elements = document.getElementById(planetname).querySelectorAll('form-check-input, [type=radio]');
    for (let index = 0; index < elements.length; index++) {
        elements[index].name = planetname + "RadioOptions";
        if (elements[index].id === "radioneutral") { elements[index].checked = true };
    }
}

function hideBuildTemplate() {
    document.getElementById('buildtemplate').classList.add('d-none');
}

function setDefaultBuildOptions(planetname, selection) {
    let elements = document.getElementById(planetname).querySelectorAll('form-check-input, [type=radio]');
    for (let index = 0; index < elements.length; index++) {
        if (elements[index].id === selection) { elements[index].checked = true; }
        elements[index].disabled = true;
    }
}

function moveBuildButton() {
    // Move build button to bottom of list
    document.getElementById('buildqueue').appendChild(document.getElementById('buildbutton'));
}

function createBuildQueue() {
    resetBuildQueueCount();

    // The 'planetnames' array is arranged by groups of regions with a number of planets
    // in each region
    for (let regionCount = 0; regionCount < planetnames.length; regionCount++) {
        let region = planetnames[regionCount];

        for (let planetCount = 0; planetCount < region.length; planetCount++) {

            let planetname = region[planetCount];
            let resources = getPlanetsBuildResources(planetname);
            let isBlockaded = false;
            let isSubjugated = false;

            let checks = document.getElementById(planetname).getElementsByClassName('form-check-input');
            for (let index = 0; index < checks.length; index++) {

                // if Blockaded checkbox is checked don't add any of this planet's resources
                if (checks[index].id == "blockade" && checks[index].checked === true) {
                    localStorage.setItem([planetname, checks[index].id], "buildchk");
                    isBlockaded = true;
                }

                if (checks[index].id == "subjugate" && checks[index].checked === true) {
                    localStorage.setItem([planetname, checks[index].id], "buildchk");
                    isSubjugated = true;
                }

                if (checks[index].checked == false) { continue; }

                updateBuildQueueCount(planetname, isBlockaded, isSubjugated, checks, index, resources);
            }
        }
    }
}

// const isBlockaded = (planetname, chk) =>{
//     if (chk.id == "chkblock" && chk.checked === true) {
//         localStorage.setItem([planetname, chk.id], "buildchk");
//         return true;
//     }

//     return false;
// }

// const isSubjugated = (planetname, chk) =>{
//     if (chk.id == "chkSub" && chk.checked === true) {
//         localStorage.setItem([planetname, chk.id], "chkSub");
//         return true;
//     }

//     return false;
// }

function updateBuildQueueCount(planetname, isBlockaded, isSubjugated, checks, index, resources) {
    let controlname = getControlName(checks, index, resources, isSubjugated);

    if (controlname == "") { return; }

    SaveSetting([planetname, checks[index].id], "buildchk");

    if (isBlockaded) { return; }

    resources.forEach(resource => {
        let resourceIcon = document.getElementById(controlname + resource[0] + "-" + resource[1] + "-" + resource[2]);
        let count = parseInt(resourceIcon.innerText);
        count++;
        if (count > 0) {
            resourceIcon.classList.remove('d-none');
            resourceIcon.innerText = count;
        }
    });
}

function getControlName(checks, index, resources, isSubjugated) {
    const selectedRadioButton = checks[index].id;

    if (selectedRadioButton == "radioempire") {
        return "build-emp-";
    }

    // Subjugated systems always build for the Empire
    if (isSubjugated && selectedRadioButton.includes("radio")) {
        if (resources.length === 2) { resources.pop(); };
        return "build-emp-";
    }

    if (selectedRadioButton == "radiorebel") {
        return "build-rebel-";
    }

    return "";
}

function getPlanetsBuildResources(planetname, subjugated = false) {
    // Each planet can have one or two resources that it produces
    // Resources are returned in arrays
    switch (planetname) {
        case "Alderaan":
        case "Coruscant":
        case "Felucia":
        case "Malastare":
        case "Kessel":
        case "Rodia":
        case "Ryloth":
            return [["ground", "tri", 1]];
        case "Bespin":
        case "Bothawui":
        case "Saleucami":
            return [["ground", "cir", 1]];
        case "Cato Neimoidia":
            return [["space", "tri", 2], ["ground", "cir", 2]];
        case "Geonosis":
            return [["space", "tri", 2], ["ground", "squ", 2]];
        case "Kashyyyk":
            return [["ground", "tri", 1], ["ground", "squ", 1]];
        case "Mandalore":
        case "Naboo":
        case "Nal Hutta":
            return [["ground", "tri", 1], ["space", "tri", 1]];
        case "Corellia":
        case "Mon Calamari":
            return [["space", "tri", 3], ["space", "squ", 3]];
        case "Mustafar":
            return [["space", "tri", 2], ["space", "cir", 2]];
        case "Mygeeto":
            return [["space", "tri", 2], ["ground", "squ", 2]];
        case "Ord Mantell":
            return [["ground", "cir", 2], ["space", "cir", 2]];
        case "Rebel Base":
            return [["space", "tri", 1], ["ground", "tri", 1]];
        case "Sullust":
            return [["ground", "tri", 2], ["ground", "squ", 2]];
        case "Toydaria":
            return [["space", "cir", 2]];
        case "Utapau":
            return [["space", "cir", 3], ["space", "squ", 3]];
        default:
            break;
    }
}

function resetBuildQueueCount() {
    document.querySelectorAll("[id^='build-'").forEach(
        element => {
            element.innerHTML = 0;
            element.classList.add('d-none');
        }
    )

    for (let [key, value] of Object.entries(localStorage)) {
        if (value === "buildchk") {
            localStorage.removeItem(key);
        }
    }
}

function resetGame() {
    localStorage.clear();

    resetRemoteSystems();
    resetBuildQueue();
}

function resetRemoteSystems() {
    document.querySelectorAll("[id^='planet-']").forEach(
        planet => {
            document.getElementById(planet.id).checked = false;
        }
    );

    numSelectedSystems = 0;
    updateNumberOfSelectedSystems();
}

function resetBuildQueue() {
    let checks = document.querySelectorAll('.form-check-input');
    for (let checkcount = 0; checkcount < checks.length; checkcount++) {
        const check = checks[checkcount];
        if (check.type == 'checkbox' && check.id == 'chkblock') {
            check.checked = false;
        } else {
            if (check.name == 'CoruscantRadioOptions' || check.name == 'Rebel BaseRadioOptions') { continue; }
            if (check.id != 'radioneutral') { continue; }

            check.checked = true;
        }
    }
}

// TODO This needs to be renamed!!
function run() {
    // alert('Working?');

    var searchText = document.getElementById('searchbar');

    var collapseElementList = [].slice.call(document.querySelectorAll('.cardlist'))

    collapseElementList.forEach(row => {
        if (row.title.toUpperCase().includes(searchText.value.toUpperCase())) {
            row.classList.remove('d-none');
        } else {
            row.classList.add('d-none');
        }
    });
}

function loadVariantSettings() {
    let settings = GetSettingsByKey("chk", true);
    settings.forEach(setting => {
        let id = setting.split(",")[0];
        let value = (setting.split(",")[1] == 'true');
        if (value) { setVariants(id) };
        document.getElementById(id).checked = value;
    });
}

function chkClick(cb) {
    setVariants(cb.id);
    SaveSetting(cb.id, cb.checked);
}

function setVariants(variantName) {
    switch (variantName) {
        case 'chkROTE-Units':
            showHideElement('ROTE-Setup');
            showHideElement('Base-Setup');
            break;
        case 'chkROTE-TacticCards':
            showHideElement('ROTE-Battles');
            showHideElement('Base-Battles');
            break;
        case 'chkvar-Movement':
            showHideElement('var-movement');
            showHideElement('Base-movement');
            break;
        case 'chkvar-Deployment':
            showHideElement('var-Empiredeploy');
            showHideElement('Base-Empiredeploy');
            break;
        case 'chkvar-UnPlayableMissions':
            showHideElement('var-Unplayablemissions');
            showHideElement('Base-Unplayablemissions');
            break;
        default:
            break;
    }
}

function showHideElement(id) {
    // var element = document.getElementById(id);
    document.querySelectorAll('#' + id).forEach(
        element => {
            if (element.classList.contains('d-none')) {
                element.classList.remove('d-none')
            } else {
                element.classList.add('d-none')
            }
        }
    )

}

const GetSettingsByValue = (val, includes = false) => {
    let settings = new Array;
    for (let [key, value] of Object.entries(localStorage)) {
        if (includes && value.includes(val)) {
            settings.push(key + "," + value)
        }
        else if (value == val) {
            settings.push(key + "," + value)
        }
    }
    return settings;
}

const GetSettingsByKey = (val, includes = false) => {
    let settings = new Array;
    for (let [key, value] of Object.entries(localStorage)) {
        if (includes && key.includes(val)) {
            settings.push(key + "," + value)
        }
        else if (key == val) {
            settings.push(key + "," + value)
        }
    }
    return settings;
}

const SaveSetting = (key, value) => {
    localStorage.setItem(key, value);
}

// function run2(e){
//     if (e.keyCode == 13) {
//         run();
//     }
// }

// searchbutton.addEventListener('click', run);
// searchbar.addEventListener('keydown', run2);

document.getElementById('searchbar').addEventListener('input', (e) => {
    run();
})


let numSelectedSystems = 0;

document.querySelectorAll('.planetbtn').forEach(
    planetbutton => {
        planetbutton.addEventListener('click', (event) => {
            if (planetbutton.checked == true) {
                numSelectedSystems++
                localStorage.setItem(planetbutton.id, "Planet")
            } else {
                numSelectedSystems--
                localStorage.removeItem(planetbutton.id)
            }

            updateNumberOfSelectedSystems();

            if (numSelectedSystems == 7) {
                alert('The rebel base is on ' + GetRebelBaseName() + '!');
                // alert(GetRebelBaseName());
            }
        })
    }
)

function updateNumberOfSelectedSystems() {
    document.getElementById('numselectedsystems').innerText = numSelectedSystems;
}

function GetRebelBaseName() {
    let rebelbase;
    document.querySelectorAll('.planetbtn').forEach(
        planetbutton => {
            if (planetbutton.checked == false) {
                rebelbase = planetbutton.title;
            }
        }
    )
    return rebelbase;
}

var dice = {
    sides: 6,
    roll: function () {
        var randomNumber = Math.floor(Math.random() * this.sides) + 1;
        return randomNumber;
    }
}

//Prints dice roll to the page
function rollD6(number) {
    var placeholder = document.getElementById('d6');
    // placeholder.innerHTML = number;
    placeholder.src = "./Resources/images/D6_" + number + ".png";
    var d6Modal = new bootstrap.Modal(document.getElementById('d6modal'));
    d6Modal.toggle();
}

// Captures all D6 button on website
document.querySelectorAll('#d6button').forEach(
    d6Button => {
        d6Button.onclick = function () {
            var result = dice.roll();
            rollD6(result);
        };
    });

//   var d6Button = document.getElementById('d6button');

//   d6Button.onclick = function() {
//     var result = dice.roll();
//     rollD6(result);
//   };

// document.getElementById('sidebarToggle').addEventListener('click', (e) => {
//     document.getElementById('sidebar').toggleClass('show');
// })

// $(document).ready(function (){
//     $('#sidebarToggle').on('click', function () {
//         $('#sidebar').toggleClass('show');
//     })
// });

// Example of getting all by toggle type
// var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
// var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
//   return new bootstrap.Popover(popoverTriggerEl)
// })

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})