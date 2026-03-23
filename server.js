// Importer les dépendances nécessaires
import express, { json } from 'express'; 
import "dotenv/config"; 
import { engine } from 'express-handlebars'; 
import helmet from 'helmet'; 
import compression from 'compression'; 
import cors from 'cors'; 
import { validateData, validateNumber } from './validations.js'; 

// Importer les fonctions
import { getToutesLesBriques, addEchange, addBriquesToEchange, getAllEchanges, getAllEchangesByUserId, deleteEchangeById, getEchangeById } from './model/exchange.js';

const app = express();
const PORT = process.env.PORT || 5000; // Définir le port sur lequel le serveur écoutera

// Configurer Handlebars comme moteur de templates
app.engine('handlebars', engine({
    helpers: {
        // Helper pour formater les dates en format local
        formatDate: (timestamp) => {
            const date = new Date(timestamp * 1000); // Convertir le timestamp en millisecondes
            return date.toLocaleString(); // Retourner la date au format local
        }
    }
}));

app.set('view engine', 'handlebars'); // Définir Handlebars comme moteur de templates
app.set('views', './views'); // Définir le répertoire des views

// Middleware pour parser les requêtes
app.use(json()); 
app.use(express.urlencoded({ extended: true })); 

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.static('public'));

// Route pour afficher tous les échanges proposés par l'utilisateur ayant l'ID 1
app.get('/mesechanges', async (req, res) => {
    try {
        // Récupère les échanges de l'utilisateur avec l'ID 1
        const echanges = await getAllEchangesByUserId(1);
        // Rend la vue 'mesechanges' avec les données des échanges
        res.render('mesechanges', {
            titre: ' | Mes Échanges',
            scripts: [],
            styles: [],
            echanges: echanges
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement des échanges');
    }
});

// Route pour récupérer et afficher tous les échanges proposés par les utilisateurs
app.get('/', async (req, res) => {
    try {
        // Récupère tous les échanges en appelant la fonction getAllEchanges
        const echanges = await getAllEchanges();
        // Rend la vue 'echanges' avec les données des échanges
        res.render('index', {
            titre: ' | Liste Des Échanges',
            scripts: [],
            styles: [],
            echanges: echanges
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement des échanges');
    }
});

// Route pour afficher la page d'accueil avec la liste de toutes les briques
app.get('/echanges', async (req, res) => {
    try {
        // Récupère toutes les briques disponibles
        const bricks = await getToutesLesBriques();
        // Rendre la vue 'createexchange' avec les briques récupérées
        res.render('creerEchange', {
            titre: ' | Créer un Échange',
            scripts: ['/js/creerechange.js'],
            styles: [],
            briques: bricks
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des briques:', error);
        res.status(500).render('error', { message: 'Erreur lors de la récupération des briques' });
    }
});

// Route POST pour créer un échange et ajouter des briques à cet échange
app.post('/creerechange', async (req, res) => {
    // Valider les données envoyées dans le corps de la requête
    if (validateData(req.body) === true) {

        const { echange, echange_brique } = req.body;
        
        const { id_utilisateur, nom_echange, id_proposition_accepte } = echange;

        try {
            // Ajouter l'échange
            const id_echange = await addEchange(id_utilisateur, nom_echange, id_proposition_accepte);

            // Ajouter les briques à l'échange
            await addBriquesToEchange(id_echange, echange_brique);

            // Retourner une réponse de succès avec l'ID de l'échange créé
            res.status(200).json({ message: 'Échange créé avec succès', id_echange });

        } catch (error) {
            console.error('Erreur lors de la création de l\'échange:', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'échange' });
        }
    } else {
        // Si les données sont invalides, renvoyer une erreur
        res.status(400).json({
            message: "Les données sont invalides. Veuillez vérifier votre demande.",
        });
    }
});

// Route POST pour supprimer un échange
app.post('/supprimerechange/:id_echange', async (req, res) => {

    const { id_echange } = req.params;

    if (validateNumber(id_echange) === true) {

        try {
            // Supprime l'échange en utilisant l'ID spécifié
            await deleteEchangeById(id_echange);
            // Redirige vers la page des échanges après suppression
            res.redirect('/mesechanges');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la suppression de l\'échange');
        }
    } else {
        // Si les données sont pas valides, renvoyer une erreur
        res.status(400).json({
            message: "Les données ne sont pas valides. Veuillez vérifier encore.",
        });
    }

});

// Route pour afficher les détails d'un échange
app.get('/echange/:id', async (req, res) => {
    const { id } = req.params;

    if (validateNumber(id) === true) {
        try {
            // Récupère les détails de l'échange en utilisant son ID
            const echangeData = await getEchangeById(id);
            res.render('echangedetails', {
                titre: ' | Details Échange',
                scripts: [],
                styles: [],
                echange: echangeData.echange,
                briques: echangeData.briques,
                valeur_totale: echangeData.valeur_totale
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors du chargement des détails de l\'échange');
        }
    } else {
        // Si les données sont invalides, renvoyer une erreur
        res.status(400).json({
            message: "Les données sont invalides. Veuillez vérifier.",
        });
    }


});

// Route pour afficher la page "À propos"
app.get('/about', (req, res) => {
    res.render('apropos', {
        titre: ' | À propos',
        scripts: [],
        styles: []
    });
});

// Route pour afficher la politique de confidentialité
app.get('/privacy', (req, res) => {
    res.render('confidentialite', {
        titre: ' | Politique de confidentialité',
        scripts: [],
        styles: []
    });
});

// Démarrer le serveur et afficher un message de confirmation
app.listen(PORT, () => {
    console.log(`Le serveur fonctionne sur le port ${PORT}`);
    console.log("http://localhost:" + PORT); // Afficher l'URL du serveur dans la console
});
