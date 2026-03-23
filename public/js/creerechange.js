// Sélection des éléments du DOM
const formCreateExchange = document.getElementById('createExchangeForm'); // Formulaire de création d'échange
const exchangeNameInput = document.getElementById('exchangeName'); // Champ de texte du nom de l'échange
const exchangeNameError = document.getElementById('exchangeNameError'); 
const quantityInputs = document.querySelectorAll('input[type="number"]'); 
const quantityError = document.getElementById('quantityError'); 
const generalExchangeNameError = document.getElementById('generalExchangeNameError'); 
const generalExchangeNameSuccess = document.getElementById('generalExchangeNameSuccess'); 



/**
 * Valide le champ du nom de l'échange.
 */
function validateExchangeName() {
    const exchangeName = exchangeNameInput.value.trim();

    // Si le nom de l'échange est vide, on ajoute un message d'erreur personnalisé
    if (!exchangeName) {
        exchangeNameInput.setCustomValidity('Le nom de l\'échange est requis.'); // Message personnalisé
        exchangeNameError.innerText = 'Le nom de l\'échange est requis.'; // Affichage du message
        exchangeNameInput.classList.add('is-invalid');
    } else {
        exchangeNameInput.setCustomValidity(''); // Supprimer le message d'erreur si le champ est valide
        exchangeNameError.innerText = ''; // Effacer l'affichage du message d'erreur
        exchangeNameInput.classList.remove('is-invalid');
    }
}

/**
 * Valide les quantités de chaque brique.
 */
function validateQuantities() {
    let valid = false;
    quantityInputs.forEach((input) => {
        if (parseInt(input.value) > 0) {
            valid = true;
        }
    });

    if (!valid) {
        quantityError.innerText = 'Veuillez entrer une quantité pour au moins une brique.';
    } else {
        quantityError.innerText = ''; // Efface l'erreur si validé
    }
}

/**
 * Valide le formulaire avant la soumission.
 */
async function validateCreateExchangeForm(event) {
    let valid = true;

    // Valider le nom de l'échange
    validateExchangeName();

    // Valider les quantités
    validateQuantities();

    // Si une des validations échoue, empêcher la soumission
    if (!exchangeNameInput.validity.valid || quantityError.innerText !== '') {
        valid = false;
        event.preventDefault(); // Empêcher l'envoi du formulaire si non valide
    }

    return valid;
}


/**
 * Préparation des données du formulaire et les envoie en JSON.
 */
async function prepareExchangeData() {
    const exchangeName = exchangeNameInput.value.trim();
    const quantities = [];

    // Récupérer les quantités et les id_brique correspondants
    quantityInputs.forEach((input) => {
        const quantity = parseInt(input.value);
        const idBrique = input.getAttribute('data-id-brique'); // Récupère l'id_brique de l'attribut data-id-brique

        if (quantity > 0 && idBrique) {
            quantities.push({ id_brique: idBrique, quantite: quantity });
        }
    });

    // Préparer l'objet echange avec les données récupérées
    const exchangeData = {
        echange: {
            id_utilisateur: 1, // Exemple d'id utilisateur, vous pouvez le remplacer dynamiquement
            nom_echange: exchangeName,
            id_proposition_accepte: null, // Si vous avez une valeur pour cette variable, vous pouvez la définir ici
        },
        echange_brique: quantities
    };

    return exchangeData;
}


/**
 * Récupère les données du formulaire et les envoie en JSON.
 */
async function submitForm(event) {
    event.preventDefault(); // Empêcher la soumission classique du formulaire

    // Validation asynchrone du formulaire
    const valid = await validateCreateExchangeForm(event);
    if (!valid) {
        return; // Si la validation échoue, on arrête l'exécution
    }

    // Préparer les données avant l'envoi
    const exchangeData = await prepareExchangeData();

    // Envoi de la requête POST avec les données JSON
    try {

        const response = await fetch('/creerEchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exchangeData)
        });

        console.log(response);

        // Check if the response is JSON
        const contentType = response.headers.get("Content-Type");
        let result = {};
        if (contentType && contentType.includes("application/json")) {
            result = await response.json(); // Parse as JSON
        } else {
            result = await response.text(); // Parse as text if it's not JSON
        }

        if (response.ok) {
            generalExchangeNameSuccess.innerText = "Échange cree avec succès !";
            formCreateExchange.reset(); 
        } else {
            console.error('Error: ', result);
            generalExchangeNameError.innerText = " Une erreur s’est produite, mais ne vous inquiétez pas, nous sommes en train de la résoudre rapidement. Merci pour votre patience ." + result;

        }

    } catch (error) {
        console.error('Erreur lors de la requête:', error);
        generalExchangeNameError.innerText = " Une erreur s’est produite, mais ne vous inquiétez pas, nous sommes en train de la résoudre rapidement. Merci pour votre patience ." + error;
    }
}

// Écouteur d'événement pour la soumission du formulaire
formCreateExchange.addEventListener('submit', submitForm);

// Ajoute un écouteur d'événement pour vérifier le champ du nom de l'échange à chaque changement
exchangeNameInput.addEventListener('input', validateExchangeName);

// Ajoute un écouteur d'événement pour vérifier les quantités à chaque changement
quantityInputs.forEach((input) => {
    input.addEventListener('input', validateQuantities);
});
