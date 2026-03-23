import connectionPromise from '../config/db.js';


/**
 * Récupère tous les échanges proposés par un utilisateur spécifié par son ID.
 * @param {number} id_utilisateur L'identifiant de l'utilisateur dont on veut récupérer les échanges.
 * @returns {Promise<Array>} La liste des échanges proposés par l'utilisateur.
 */
export async function getAllEchangesByUserId(id_utilisateur) {
    const db = await connectionPromise;

    // Requête SQL pour récupérer tous les échanges proposés par l'utilisateur spécifié
    const echanges = await db.all(
        `SELECT e.id_echange, e.nom_echange, u.nom as nom_utilisateur
         FROM echange e
         JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
         WHERE e.id_utilisateur = ?`,
        [id_utilisateur]
    );

    return echanges;
}

/**
 * Récupère tous les échanges proposés par les utilisateurs.
 * @returns {Promise<Array>} Une promesse contenant un tableau d'objets représentant tous les échanges.
 * Chaque objet contient les propriétés suivantes :
 *  - id_echange (number) : L'identifiant de l'échange.
 *  - nom_echange (string) : Le nom de l'échange.
 *  - nom_utilisateur (string) : Le nom de l'utilisateur ayant proposé l'échange.
 */
export async function getAllEchanges() {
    const db = await connectionPromise;

    // Requête SQL pour récupérer tous les échanges avec le nom de l'utilisateur
    const echanges = await db.all(
        `SELECT e.id_echange, e.nom_echange, u.nom as nom_utilisateur
         FROM echange e
         JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur`
    );

    return echanges;
}

/**
 * Ajoute un nouvel échange dans la base de données.
 * @param {number} id_utilisateur L'identifiant de l'utilisateur.
 * @param {string} nom_echange Le nom de l'échange.
 * @param {number} id_proposition_accepte L'identifiant de la proposition acceptée (peut être null).
 * @returns {Promise<number>} L'identifiant de l'échange ajouté.
 */
export async function addEchange(id_utilisateur, nom_echange, id_proposition_accepte) {
    const db = await connectionPromise;
    // Exécuter la requête SQL pour insérer un nouvel échange
    const res = await db.run(
        `INSERT INTO echange(id_utilisateur, nom_echange, id_proposition_accepte)
         VALUES (?, ?, ?)`,
        [id_utilisateur, nom_echange, id_proposition_accepte]
    );
    return res.lastID; // Retourne une promesse contenant l'identifiant de l'échange ajouté
}

/**
 * Ajoute des briques à un échange dans la table `echange_brique`.
 * @param {number} id_echange L'identifiant de l'échange.
 * @param {Array} briques Un tableau d'objets contenant `id_brique` et `quantite`.
 * @returns {Promise<void>} Une promesse résolue une fois que toutes les insertions de briques sont terminées.
 */
export async function addBriquesToEchange(id_echange, briques) {
    const db = await connectionPromise;

    for (const brique of briques) {
        try {
            // Exécuter l'insertion pour chaque brique
            await db.run(
                `INSERT INTO echange_brique(id_echange, id_brique, quantite) VALUES (?, ?, ?)`,
                [id_echange, brique.id_brique, brique.quantite]
            );
        } catch (error) {
            console.error(`Erreur lors de l'insertion de la brique ${brique.id_brique} :`, error);
            throw error; // Rejette la promesse si une insertion échoue
        }
    }
}

/**
 * Récupère toutes les briques existantes.
 * @returns {Promise<Array>} Un tableau d'objets contenant toutes les briques.
 */
export async function getToutesLesBriques() {
    const db = await connectionPromise;
    // Exécuter la requête SQL pour récupérer toutes les briques
    const briques = await db.all(
        `SELECT *
         FROM brique`
    );
    return briques; // Retourne une promesse contenant un tableau de toutes les briques existantes
}



/**
 * Supprime un échange par son identifiant, ainsi que toutes les briques associées dans la table echange_brique.
 * @param {number} id_echange L'identifiant de l'échange à supprimer.
 * @returns {Promise<void>} Une promesse indiquant la fin de l'opération de suppression.
 */
export async function deleteEchangeById(id_echange) {
    const db = await connectionPromise;

    // Supprimer d'abord les associations dans la table echange_brique
    await db.run(
        `DELETE FROM echange_brique WHERE id_echange = ?`,
        [id_echange]
    );

    // Ensuite, supprimer l'échange de la table echange
    await db.run(
        `DELETE FROM echange WHERE id_echange = ?`,
        [id_echange]
    );
}

/**
 * Récupère les détails d'un échange spécifique, y compris les briques associées et la valeur totale de l'échange.
 * @param {number} id_echange L'identifiant de l'échange.
 * @returns {Promise<Object>} Un objet contenant les informations de l'échange ou null si l'échange n'existe pas.
 */
export async function getEchangeById(id_echange) {
    const db = await connectionPromise;

    // Récupérer les détails de l'échange
    const echange = await db.get(
        `SELECT e.id_echange, e.nom_echange, u.nom AS nom_utilisateur
         FROM echange e
         JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
         WHERE e.id_echange = ?`, [id_echange]
    );

    if (!echange) {
        return null;
    }

    // Récupérer les briques associées à l'échange
    const briques = await db.all(
        `SELECT b.nom AS nom_brique, eb.quantite, b.valeur, ROUND(b.valeur * eb.quantite, 2) AS sous_total
         FROM echange_brique eb
         JOIN brique b ON eb.id_brique = b.id_brique
         WHERE eb.id_echange = ?`, [id_echange]
    );

    // Calculer la valeur totale de l'échange
    let valeur_totale = 0;
    briques.forEach(brique => {
        valeur_totale += brique.valeur * brique.quantite;
    });

    valeur_totale = parseFloat(valeur_totale.toFixed(2));

    return {
        echange,
        briques,
        valeur_totale
    };
}