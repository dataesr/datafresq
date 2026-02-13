---
label: "SISE"
title: "SISE"
description: "Système d'Information sur le Suivi de l'Étudiant : effectifs et inscriptions."
order: 2
keywords: [SISE, effectifs, inscriptions, étudiants, genre, géographie, inscriptions principales, CPGE]
---

**SISE** (Système d'Information sur le Suivi de l'Étudiant) est le dispositif de collecte
des inscriptions dans l'enseignement supérieur public, géré par la sous-direction des
Systèmes d'information et études statistiques (SIES) du ministère de l'Enseignement
supérieur et de la Recherche (MESR).

## Inscriptions principales

Les effectifs affichés dans DataFresq reposent sur la notion d'**inscription principale**.
Un même étudiant peut prendre plusieurs inscriptions administratives dans un ou plusieurs
établissements. Au sein d'un même établissement, une seule est déclarée « principale »,
les autres sont « secondes ». Cette notion permet de dénombrer les étudiants en personnes
physiques, sans double compte au sein d'un même établissement.

Les inscriptions sont observées à la **date du 15 janvier** de chaque année universitaire.

## Variable d'effectif utilisée

Le jeu de données SISE propose plusieurs mesures d'effectif. DataFresq utilise la variable
`effectif`, qui correspond aux **inscriptions principales y compris doubles inscriptions
CPGE** (étudiants de classes préparatoires inscrits en parallèle à l'université).

> [!NOTE]
> Depuis 2018-2019, la mise en place progressive de conventions entre les lycées
> possédant des CPGE et les universités augmente significativement le nombre d'inscriptions
> en licence. Une partie de la hausse des effectifs observée à partir de cette date peut
> être liée à l'extension de ces conventions et non à une augmentation réelle du nombre
> d'étudiants. Pour plus de détails, consultez la page
> [Indicateurs — Effectifs et féminisation](/guide/indicateurs/effectifs).

## Dimensions disponibles

Les données SISE sont ventilées dans DataFresq selon les dimensions suivantes :

| Dimension | Utilisation | Nom |
|---|---|---|
| **Genre** | [Fiche formation](/guide/formations/effectifs), [Espace](/guide/espaces/effectifs) | Répartition et taux de féminisation |
| **Cycle** | [Espace](/guide/espaces/effectifs) | Licence, Master, Doctorat |
| **Diplôme** | [Espace](/guide/espaces/effectifs) | Type de diplôme préparé |
| **Discipline** | [Espace](/guide/espaces/effectifs) | Secteur disciplinaire |
| **Grande discipline** | [Espace](/guide/espaces/effectifs) | Regroupement disciplinaire |
| **Établissement** | [Espace](/guide/espaces/effectifs) | Établissement d'inscription |
| **Académie** | [Espace](/guide/espaces/effectifs) | Académie du siège |
| **Région** | [Espace](/guide/espaces/effectifs) | Région du siège |
| **Commune** | [Fiche formation](/guide/formations/effectifs), [Espace](/guide/espaces/effectifs) | Commune de l'unité d'inscription |
| **Année d'étude** | [Fiche formation](/guide/formations/effectifs), [Espace](/guide/espaces/effectifs) | Degré d'études dans la formation |


## Couverture et limites

- Les données couvrent les **établissements publics sous tutelle du MESR** disposant d'une personnalité morale et remontant via SISE. Certains établissements publics remontant par d'autres dispositifs ne sont pas inclus.
- L'appariement entre les formations [Fresq](/guide/donnees/fresq) et les données SISE repose sur les **codes SISE** associés à la formation et ses parcours. Si ces codes sont absents ou incorrects, les données ne peuvent pas être reliées.
- Les données sont disponibles à partir de l'année universitaire **2015-2016**.

> [!WARNING]
> Les formations sans données SISE n'affichent pas l'onglet
> [« Effectifs étudiants »](/guide/formations/effectifs) sur leur fiche. Dans le tableau
> de recherche, le filtre [« Données SISE disponibles »](/guide/recherche/filtres)
> permet d'isoler les formations couvertes.

## Fréquence de mise à jour

Les données SISE sont publiées annuellement. Elles sont intégrées dans
DataFresq, généralement au cours du premier semestre
de l'année civile. Les données de l'année universitaire en cours ne sont donc
disponibles qu'avec un décalage.

## Source

Les données sont issues du jeu de données ouvert
[Effectifs d'étudiants inscrits dans les établissements publics sous tutelle du MESR](https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-sise-effectifs-d-etudiants-inscrits-esr-public/)
produit par la sous-direction des Systèmes d'information et études statistiques (SIES),
publié sous Licence Ouverte.
