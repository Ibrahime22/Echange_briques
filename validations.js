/**
 * Fonction simple de validation des données d'échange.
 * Cette fonction vérifie que les données sont valides avant de les utiliser.
 *
 * @param {Object} data - Les données de l'échange à valider.
 * @returns {boolean} - Retourne `true` si les données sont valides, `false` si elles sont invalides.
 */
export function validateData(data) {
    // Vérifie si l'objet 'echange' existe et a les bonnes propriétés
    if (!data.echange || !data.echange.id_utilisateur || !data.echange.nom_echange) {
        console.log("L'objet 'echange' est incomplet.");
        return false; // Si quelque chose est manquant dans 'echange', retourne false
    }

    // Vérifie que l'ID de l'utilisateur est un nombre positif
    if (typeof data.echange.id_utilisateur !== 'number' || data.echange.id_utilisateur <= 0) {
        console.log("L'id_utilisateur doit être un nombre positif.");
        return false; // Si l'ID n'est pas valide, retourne false
    }

    // Vérifie que le nom de l'échange est une chaîne de caractères non vide
    if (typeof data.echange.nom_echange !== 'string' || data.echange.nom_echange.trim() === '') {
        console.log("Le nom de l'échange doit être une chaîne de caractères non vide.");
        return false; // Si le nom de l'échange est vide ou invalide, retourne false
    }

    // Vérifie que la liste 'echange_brique' existe et n'est pas vide
    if (!Array.isArray(data.echange_brique) || data.echange_brique.length === 0) {
        console.log("L'objet 'echange_brique' doit être un tableau non vide.");
        return false; // Si 'echange_brique' n'est pas valide, retourne false
    }

    // Vérifie chaque brique dans 'echange_brique'
    for (let i = 0; i < data.echange_brique.length; i++) {
        const brique = data.echange_brique[i];

        // Vérifie que l'ID de chaque brique est un nombre
        if (typeof brique.id_brique !== 'string' || brique.id_brique.trim() === '') {
            console.log("Chaque brique doit avoir un ID valide.");
            return false; // Si l'ID de la brique est invalide, retourne false
        }

        // Vérifie que la quantité est un nombre positif
        if (typeof brique.quantite !== 'number' || brique.quantite <= 0) {
            console.log("La quantité de chaque brique doit être un nombre positif.");
            return false; // Si la quantité est invalide, retourne false
        }
    }

    // Si tout est valide, retourne true
    return true;
}

/**
 * Fonction simple de validation des nombre entier.
 * Cette fonction vérifie que les nombres entiers sont valides avant de les utiliser.
 * https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
 * @param {Object} data - Les données de l'échange à valider.
 * @returns {boolean} - Retourne `true` si les données sont valides, `false` si elles sont invalides.
 */
export function validateNumber(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
  }
