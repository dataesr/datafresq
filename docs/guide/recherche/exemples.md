---
label: "Exemples"
title: "Exemples de recherches"
description: "Illustrations concrètes de requêtes combinant opérateurs et filtres."
order: 3
keywords: [exemples, requêtes, combinaisons, nucléaire, informatique, droit]
---

Voici quelques requêtes pour illustrer les possibilités de la recherche. Chaque exemple
combine des [opérateurs](/guide/recherche/operateurs) et peut être affiné
avec les [filtres avancés](/guide/recherche/filtres).

## Recherches avec opérateurs
---

| Recherche | Ce que vous obtenez |
|-----------|---------------------|
| `nucléaire && énergie` | Formations contenant à la fois « nucléaire » et « énergie » |
| `"sciences politiques"` | L'expression exacte « sciences politiques » |
| `informatique !réseau` | Formations en informatique, en excluant celles liées aux réseaux |
| `(droit \|\| juridique) && européen` | Formations en droit ou juridique, avec une dimension européenne |
| `bio*` | Formations dont un terme commence par « bio » (biologie, biotechnologie, bioéthique…) |
| `"génie civil" && !alternance` | Génie civil en excluant les formations en alternance |
| `(intelligence \|\| artificielle) && (master \|\| ingénieur)` | Formations liées à l'IA de niveau Master ou Ingénieur |

## Combinaison recherche + filtres
---

Les opérateurs de recherche se combinent naturellement avec les filtres de la page
[Formations](/formations). Voici quelques scénarios courants :


**Trouver les masters en data science en Île-de-France**

1. Saisissez `"data science"` dans la barre de recherche.
2. Appliquez le filtre **Cycle** → « Master ».
3. Appliquez le filtre **Région** → « Île-de-France ».

**Explorer l'offre en ingénierie avec des données d'insertion**

1. Saisissez `ingénieur*` pour capturer « ingénieur », « ingénierie », etc.
2. Appliquez le filtre **Type de diplôme** → « Diplôme d'ingénieur ».
3. Activez le filtre **Données disponibles** → « Données SISE disponibles » pour n'afficher que les formations ayant des effectifs étudiants.

**Comparer les formations en droit dans le public et le privé**

1. Saisissez `droit` dans la barre de recherche.
2. Appliquez le filtre **Cycle** → « Licence ».
3. Créez deux [espaces de travail](/guide/espaces/creer) : l'un avec le filtre **Secteur** → « Public », l'autre avec « Privé ».
4. Comparez les indicateurs agrégés dans chaque espace.

> [!TIP]
> **Astuce :** les filtres sont reflétés dans l'URL de la page. Vous pouvez donc partager un lien de recherche avec un collègue : il retrouvera exactement les mêmes résultats, filtres et mots-clés inclus.

## Cas particuliers

**Recherche par code**

Vous pouvez rechercher directement un code INF, un code SISE ou un code RNCP dans la
barre de recherche. Par exemple, `RNCP34567` trouvera la formation associée à
ce code de certification.

**Recherche par établissement**

Saisissez le nom ou le sigle d'un établissement. Par exemple, `Sorbonne`,
`INSA` ou `Polytechnique` retourneront les formations portées par
ces établissements. Vous pouvez combiner avec un domaine :
`INSA && informatique`.

**Recherche par métier**

Si vous recherchez les formations menant à un métier précis, saisissez le nom du métier.
La recherche porte notamment sur les appellations ROME et les types d'emploi RNCP. Par
exemple, `"développeur web"` ou `"infirmier"`.
