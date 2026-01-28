import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';

function useScrollToAnchor() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.slice(1);

    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [hash]);
}

interface FaqSectionProps {
  id: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
}

function FaqSection({ id, title, icon, children }: FaqSectionProps) {
  return (
    <section id={id} className="fr-mb-6w">
      <h2 className="fr-h4 fr-mb-3w">
        {icon && (
          <span className={`icon-box icon-box--inline ${icon} fr-mr-1w`} aria-hidden="true" />
        )}
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

interface FaqItemProps {
  id: string;
  question: string;
  children: React.ReactNode;
}

function FaqItem({ id, question, children }: FaqItemProps) {
  return (
    <div id={id} className="fr-mb-4w">
      <h3 className="fr-h6 fr-mb-2w">{question}</h3>
      <div className="fr-text--sm">{children}</div>
    </div>
  );
}

export default function Faq() {
  useScrollToAnchor();

  return (
    <div className="page">
      <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
        <button
          type="button"
          className="fr-breadcrumb__button"
          aria-expanded="false"
          aria-controls="breadcrumb-1"
        >
          Voir le fil d'Ariane
        </button>
        <div className="fr-collapse" id="breadcrumb-1">
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="#" className="fr-breadcrumb__link" aria-current="page">
                Foire aux questions
              </Link>
            </li>
          </ol>
        </div>
      </nav>
      <nav className="fr-summary fr-mb-4w" aria-labelledby="fr-summary-title">
        <h2 className="fr-summary__title" id="fr-summary-title">
          Sommaire
        </h2>
        <ol>
          <li>
            <Link className="fr-summary__link" to="#sources">
              Sources de données
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#effectifs">
              Effectifs étudiants (SISE)
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#insertion">
              Insertion professionnelle (InserSup)
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#salaires">
              Données salariales
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#debouches">
              Débouchés professionnels (ROME)
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#confidentialite">
              Confidentialité et seuils
            </Link>
          </li>
          <li>
            <Link className="fr-summary__link" to="#espaces">
              Espaces de travail
            </Link>
          </li>
        </ol>
      </nav>
      <h1 className="fr-h2 fr-mb-4w">Foire aux questions</h1>
      <p className="fr-mb-6w">
        Cette page explique les sources de données utilisées dans DataFresq, les méthodes de calcul
        des indicateurs, et les règles de confidentialité appliquées.
      </p>

      <FaqSection id="sources" title="Sources de données" icon="fr-icon-database-line">
        <FaqItem id="sources-fresq" question="Qu'est-ce que la base Fresq ?">
          <p>
            La base Fresq (Formation et Recherche de l'Enseignement Supérieur avec Qualité) est un
            référentiel des formations de l'enseignement supérieur français maintenu par le
            Ministère de l'Enseignement Supérieur et de la Recherche (MESR).
          </p>
          <p className="fr-mt-2w">
            Elle contient les informations administratives des formations : intitulé, cycle
            (Licence, Master, Doctorat), type de diplôme, établissement(s), accréditation, etc.
          </p>
        </FaqItem>

        <FaqItem id="sources-sise" question="Qu'est-ce que SISE ?">
          <p>
            <strong>SISE</strong> (Système d'Information sur le Suivi de l'Étudiant) est le système
            de collecte des inscriptions dans l'enseignement supérieur. Il recense chaque année les
            effectifs d'étudiants inscrits dans les établissements.
          </p>
          <p className="fr-mt-2w">Les données SISE permettent de connaître :</p>
          <ul className="fr-mt-1w">
            <li>Le nombre total d'inscrits par formation</li>
            <li>La répartition femmes/hommes</li>
            <li>La répartition par année d'études</li>
            <li>La répartition géographique (communes, académies, régions)</li>
          </ul>
        </FaqItem>

        <FaqItem id="sources-insersup" question="Qu'est-ce que InserSup ?">
          <p>
            <strong>InserSup</strong> (Insertion professionnelle des diplômés de l'enseignement
            supérieur) est une enquête nationale menée par le MESR auprès des diplômés de
            l'enseignement supérieur.
          </p>
          <p className="fr-mt-2w">Cette enquête mesure :</p>
          <ul className="fr-mt-1w">
            <li>Le taux d'emploi à différentes échéances après l'obtention du diplôme</li>
            <li>La nature des emplois (salarié, non-salarié, stable)</li>
            <li>Les niveaux de salaire (quartiles)</li>
          </ul>
          <p className="fr-mt-2w">
            Les données sont collectées à 6, 12, 18, 24 et 30 mois après l'obtention du diplôme.
          </p>
        </FaqItem>

        <FaqItem id="sources-rome" question="Qu'est-ce que le référentiel ROME ?">
          <p>
            Le <strong>ROME</strong> (Répertoire Opérationnel des Métiers et des Emplois) est un
            référentiel maintenu par France Travail (ex Pôle Emploi) qui répertorie l'ensemble des
            métiers.
          </p>
          <p className="fr-mt-2w">
            Dans DataFresq, les codes ROME sont associés aux formations via le <strong>RNCP</strong>{' '}
            (Répertoire National des Certifications Professionnelles), ce qui permet de visualiser
            les métiers accessibles après une formation.
          </p>
        </FaqItem>
      </FaqSection>

      <FaqSection id="effectifs" title="Effectifs étudiants (SISE)" icon="fr-icon-user-line">
        <FaqItem id="effectifs-calcul" question="Comment sont calculés les effectifs ?">
          <p>
            Les effectifs sont issus du système SISE et représentent le nombre d'inscriptions
            principales enregistrées pour chaque formation à la date de remontée des données
            (généralement en janvier de l'année universitaire en cours).
          </p>
          <div className="fr-callout fr-callout--brown-caramel fr-mt-2w">
            <p className="fr-callout__text">
              <strong>Note :</strong> Un étudiant peut être inscrit dans plusieurs formations. Les
              effectifs comptabilisent les inscriptions, pas les individus uniques.
            </p>
          </div>
        </FaqItem>

        <FaqItem
          id="effectifs-feminisation"
          question="Comment est calculé le taux de féminisation ?"
        >
          <p>Le taux de féminisation est calculé selon la formule :</p>
          <p className="fr-mt-2w fr-p-2w fr-background-alt--grey">
            <code>Taux de féminisation = (Nombre de femmes / Effectif total) × 100</code>
          </p>
          <p className="fr-mt-2w">Ce taux est exprimé en pourcentage.</p>
        </FaqItem>

        <FaqItem id="effectifs-evolution" question="Comment est calculée l'évolution ?">
          <p>
            Les graphiques d'évolution présentent les effectifs pour chaque année universitaire
            disponible. Lorsqu'au moins 2 années sont disponibles, le graphique d'évolution est
            affiché.
          </p>
          <p className="fr-mt-2w">Les tendances sont calculées sur les données brutes :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Effectif total</strong> : somme des inscriptions par année
            </li>
            <li>
              <strong>Femmes / Hommes</strong> : répartition par genre et par année
            </li>
          </ul>
        </FaqItem>
      </FaqSection>

      <FaqSection
        id="insertion"
        title="Insertion professionnelle (InserSup)"
        icon="fr-icon-briefcase-line"
      >
        <FaqItem id="insertion-population" question="Quelle est la population étudiée ?">
          <p>Les données d'insertion concernent les diplômés répondant aux critères suivants :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Obtention du diplôme</strong> : seuls les diplômés sont pris en compte
            </li>
            <li>
              <strong>Nationalité française</strong> : pour des raisons de suivi statistique
            </li>
            <li>
              <strong>Formation initiale</strong> : les inscriptions en formation continue sont
              exclues
            </li>
          </ul>
          <div className="fr-callout fr-callout--brown-caramel fr-mt-2w">
            <p className="fr-callout__text">
              Les <strong>poursuivants d'études</strong> (diplômés ayant repris des études) peuvent
              être distingués des <strong>sortants</strong> (diplômés entrés sur le marché du
              travail).
            </p>
          </div>
        </FaqItem>

        <FaqItem id="insertion-taux-emploi" question="Comment est calculé le taux d'emploi ?">
          <p>Le taux d'emploi salarié en France est calculé selon la formule :</p>
          <p className="fr-mt-2w fr-p-2w fr-background-alt--grey">
            <code>
              Taux d'emploi = (Nombre de sortants en emploi salarié / Nombre de sortants) × 100
            </code>
          </p>
          <p className="fr-mt-2w">Ce taux est mesuré à différentes échéances :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>M+6</strong> : 6 mois après le diplôme
            </li>
            <li>
              <strong>M+12</strong> : 12 mois après le diplôme
            </li>
            <li>
              <strong>M+18</strong> : 18 mois après le diplôme
            </li>
            <li>
              <strong>M+24</strong> : 24 mois après le diplôme
            </li>
            <li>
              <strong>M+30</strong> : 30 mois après le diplôme
            </li>
          </ul>
        </FaqItem>

        <FaqItem id="insertion-types-emploi" question="Quels sont les types d'emploi mesurés ?">
          <p>Trois indicateurs d'emploi sont disponibles :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Emploi salarié en France</strong> : emplois salariés sur le territoire
              français
            </li>
            <li>
              <strong>Emploi non salarié</strong> : travailleurs indépendants, auto-entrepreneurs
            </li>
            <li>
              <strong>Emploi stable</strong> : CDI ou fonctionnaires parmi les salariés
            </li>
          </ul>
          <p className="fr-mt-2w">
            Le taux d'emploi stable représente la part des emplois "stables" (CDI, fonctionnaires)
            parmi l'ensemble des emplois salariés.
          </p>
        </FaqItem>

        <FaqItem id="insertion-cohortes" question="Qu'est-ce qu'une cohorte ou promotion ?">
          <p>
            Une <strong>cohorte</strong> (ou promotion) désigne l'ensemble des diplômés d'une même
            année. Par exemple, la "promotion 2020" regroupe tous les étudiants ayant obtenu leur
            diplôme au cours de l'année universitaire 2019-2020.
          </p>
          <p className="fr-mt-2w">
            Les graphiques d'évolution permettent de comparer les taux d'emploi de différentes
            promotions à la même échéance après le diplôme.
          </p>
        </FaqItem>
      </FaqSection>

      <FaqSection id="salaires" title="Données salariales" icon="fr-icon-money-euro-circle-line">
        <FaqItem id="salaires-quartiles" question="Que signifient les quartiles de salaire ?">
          <p>Les salaires sont présentés sous forme de quartiles :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Q1 (1er quartile)</strong> : 25% des salariés gagnent moins que cette valeur
            </li>
            <li>
              <strong>Médiane (Q2)</strong> : 50% des salariés gagnent moins que cette valeur
            </li>
            <li>
              <strong>Q3 (3e quartile)</strong> : 75% des salariés gagnent moins que cette valeur
            </li>
          </ul>
          <div className="fr-callout fr-mt-2w">
            <p className="fr-callout__text">
              <strong>Exemple :</strong> Si la médiane est de 2 000 €, cela signifie que la moitié
              des diplômés en emploi gagnent moins de 2 000 € nets mensuels, et l'autre moitié gagne
              plus.
            </p>
          </div>
        </FaqItem>

        <FaqItem id="salaires-type" question="De quel type de salaire s'agit-il ?">
          <p>
            Les salaires affichés sont des <strong>salaires nets mensuels</strong>, exprimés en
            euros.
          </p>
          <p className="fr-mt-2w">
            Ils sont calculés à partir des déclarations des diplômés lors de l'enquête InserSup, et
            concernent les emplois salariés en France uniquement.
          </p>
        </FaqItem>

        <FaqItem id="salaires-seuil" question="Pourquoi certaines données sont masquées ?">
          <p>
            Les données salariales ne sont affichées que lorsque l'échantillon est suffisant. Un
            minimum de <strong>5 réponses</strong> est nécessaire pour afficher les quartiles de
            salaire.
          </p>
          <p className="fr-mt-2w">
            Cette règle protège la confidentialité des répondants et garantit la fiabilité
            statistique des indicateurs.
          </p>
        </FaqItem>
      </FaqSection>

      <FaqSection
        id="debouches"
        title="Débouchés professionnels (ROME)"
        icon="fr-icon-road-map-line"
      >
        <FaqItem id="debouches-source" question="D'où proviennent les données sur les métiers ?">
          <p>
            Les métiers associés à une formation proviennent du croisement de plusieurs référentiels
            :
          </p>
          <ul className="fr-mt-1w">
            <li>
              <strong>RNCP</strong> : Répertoire National des Certifications Professionnelles
            </li>
            <li>
              <strong>ROME</strong> : Répertoire Opérationnel des Métiers et des Emplois
            </li>
          </ul>
          <p className="fr-mt-2w">
            Chaque formation certifiée est enregistrée au RNCP avec une liste de codes ROME
            correspondant aux métiers accessibles.
          </p>
        </FaqItem>

        <FaqItem id="debouches-structure" question="Comment sont organisés les métiers ?">
          <p>Les métiers du référentiel ROME sont organisés de manière hiérarchique :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Niveau 1</strong> : Grands domaines professionnels (ex: "Agriculture et
              Pêche")
            </li>
            <li>
              <strong>Niveau 2</strong> : Catégories de métiers
            </li>
            <li>
              <strong>Niveau 3</strong> : Familles de métiers
            </li>
            <li>
              <strong>Métiers</strong> : Appellations précises des emplois
            </li>
          </ul>
        </FaqItem>
      </FaqSection>

      <FaqSection id="confidentialite" title="Confidentialité et seuils" icon="fr-icon-lock-line">
        <FaqItem
          id="confidentialite-seuil-emploi"
          question="Quel est le seuil pour les taux d'emploi ?"
        >
          <p>
            Les taux d'emploi (salarié, non-salarié, stable) ne sont affichés que lorsque le nombre
            de <strong>sortants est supérieur ou égal à 20</strong>.
          </p>
          <p className="fr-mt-2w">
            En dessous de ce seuil, les données sont masquées pour préserver la confidentialité des
            individus et garantir la représentativité statistique.
          </p>
          <div className="fr-callout fr-callout--brown-caramel fr-mt-2w">
            <p className="fr-callout__text">
              Lorsque les données sont masquées, un message explicatif est affiché avec le nombre
              réel de sortants.
            </p>
          </div>
        </FaqItem>

        <FaqItem
          id="confidentialite-seuil-salaire"
          question="Quel est le seuil pour les données salariales ?"
        >
          <p>
            Les quartiles de salaire (Q1, médiane, Q3) ne sont affichés que lorsque le nombre de
            réponses salariales est <strong>supérieur ou égal à 5</strong>.
          </p>
          <p className="fr-mt-2w">
            Ce seuil plus bas que celui des taux d'emploi s'explique par le fait que les données
            salariales sont agrégées (quartiles) et non individuelles.
          </p>
        </FaqItem>

        <FaqItem
          id="confidentialite-donnees-manquantes"
          question="Pourquoi certaines formations n'ont pas de données ?"
        >
          <p>Plusieurs raisons peuvent expliquer l'absence de données pour une formation :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Formation récente</strong> : les données SISE ou InserSup ne sont pas encore
              disponibles
            </li>
            <li>
              <strong>Effectifs insuffisants</strong> : les seuils de confidentialité ne sont pas
              atteints
            </li>
            <li>
              <strong>Appariement impossible</strong> : la formation n'a pas pu être reliée aux
              bases de données sources
            </li>
            <li>
              <strong>Formation non concernée</strong> : certains types de formations ne sont pas
              couverts par les enquêtes InserSup
            </li>
          </ul>
        </FaqItem>
      </FaqSection>

      <FaqSection id="espaces" title="Espaces de travail" icon="fr-icon-folder-2-line">
        <FaqItem id="espaces-definition" question="Qu'est-ce qu'un espace de travail ?">
          <p>
            Un <strong>espace de travail</strong> permet de regrouper plusieurs formations pour
            analyser leurs données de manière agrégée.
          </p>
          <p className="fr-mt-2w">
            Vous pouvez par exemple créer un espace regroupant toutes les formations de votre
            établissement, d'une discipline particulière, ou selon tout autre critère.
          </p>
        </FaqItem>

        <FaqItem
          id="espaces-calculs"
          question="Comment sont calculées les statistiques d'un espace ?"
        >
          <p>
            Les statistiques d'un espace de travail sont calculées en agrégeant les données de
            toutes les formations qu'il contient :
          </p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Effectifs</strong> : somme des inscriptions de toutes les formations
            </li>
            <li>
              <strong>Taux d'emploi</strong> : moyenne pondérée par le nombre de sortants
            </li>
            <li>
              <strong>Répartitions</strong> : agrégation par catégorie (cycle, académie, etc.)
            </li>
          </ul>
        </FaqItem>

        <FaqItem id="espaces-partage" question="Puis-je partager un espace de travail ?">
          <p>Oui, vous pouvez inviter d'autres utilisateurs à accéder à vos espaces :</p>
          <ul className="fr-mt-1w">
            <li>
              <strong>Lecteur</strong> : peut consulter l'espace et ses données
            </li>
            <li>
              <strong>Éditeur</strong> : peut modifier les formations de l'espace
            </li>
          </ul>
          <p className="fr-mt-2w">
            Les espaces peuvent également être rendus publics pour être accessibles à tous les
            utilisateurs de la plateforme.
          </p>
        </FaqItem>
      </FaqSection>

      <section id="contact" className="fr-mt-8w">
        <div className="fr-callout">
          <h3 className="fr-callout__title">Une question ?</h3>
          <p className="fr-callout__text">
            Si vous avez une question qui n'est pas traitée dans cette FAQ, n'hésitez pas à nous
            contacter.
          </p>
          <Link to="/contact" className="fr-btn fr-mt-2w">
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
