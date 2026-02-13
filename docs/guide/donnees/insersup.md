---
label: "InserSup"
title: "InserSup"
description: "Système d'information sur l'insertion professionnelle des diplômés du supérieur."
order: 3
keywords: [InserSup, insertion, diplômés, emploi, salaire, cohorte, sortants, DSN, SIES]
---

**InserSup** est un système d'information développé par la sous-direction des Systèmes
d'information et des études statistiques (SIES) du ministère de l'Enseignement supérieur
et de la Recherche (MESR). Il permet de mesurer et qualifier l'insertion professionnelle
des diplômés de l'enseignement supérieur à partir d'appariements de fichiers
administratifs.

> [!NOTE]
> InserSup n'est pas une enquête déclarative. Les données reposent sur des
> appariements entre les fichiers de suivi des étudiants et des sources administratives
> sur l'emploi (voir [Sources administratives](#sources-administratives) ci-dessous).

## Sources administratives

InserSup croise plusieurs fichiers :

- **Fichiers SISE** — suivi des étudiants inscrits dans l'enseignement supérieur
- **Déclarations sociales nominatives (DSN)** — données mensuelles d'emploi salarié, fournies par la direction de l'animation de la recherche, des études et des statistiques (DARES) du ministère du Travail
- **Base non-salariés (BNS)** — données annuelles d'emploi non salarié, transmise par l'INSEE

L'appariement de ces fichiers permet de suivre le parcours professionnel des diplômés
sans recourir à une enquête déclarative, en observant directement leur situation dans
les fichiers d'emploi.

## Population étudiée

DataFresq filtre les données InserSup selon les critères suivants :

- **Diplômés uniquement** (`obtention_diplome = diplômé`) : seuls les étudiants ayant
  obtenu leur diplôme sont pris en compte, c'est-à-dire les étudiants d'année terminale
  remontés par les établissements au ministère avant la date du 1er mars (pour les
  universités) ou du 15 mai (pour les écoles d'ingénieurs et de management)
- **Nationalité française** (`nationalite = français`) : le suivi via les DSN et la BNS
  ne couvre que l'emploi en France, ce qui rend le suivi des diplômés étrangers partiel.
  Le nombre de sortants étrangers est néanmoins affiché à titre indicatif
- **Tous régimes d'inscription** (`regime_inscription = ensemble`) : formation initiale
  et apprentissage sont inclus

Parmi les diplômés, on distingue :

- **Sortants** (`nb_sortants`) — diplômés entrés sur le marché du travail
- **Poursuivants** (`nb_poursuivants`) — diplômés ayant repris des études

Les taux d'emploi sont calculés sur l'ensemble des diplômés (sortants actifs ou inactifs),
et non uniquement sur les sortants en emploi.

## Champ couvert

InserSup couvre les diplômés des formations suivantes :

- Licence générale
- Licence professionnelle
- Master
- Bachelor universitaire de technologie (BUT)
- Diplôme d'ingénieur
- Diplômes à visée bac+5 de management
- Bac+3 grade licence et bac+5 grade master

Les établissements couverts sont les universités et assimilés, les écoles de management
et les écoles d'ingénieurs. Le dispositif est appelé à s'étendre progressivement à
d'autres diplômes et établissements.

## Données disponibles

### Emploi

L'insertion est mesurée à **5 échéances** après la diplomation : 6, 12, 18, 24 et
30 mois. Trois indicateurs d'emploi sont fournis à chaque échéance :

| Indicateur | Description |
|---|---|
| **Emploi salarié en France** | Part des diplômés en emploi salarié en France parmi l'ensemble des diplômés (actifs ou inactifs) |
| **Emploi non salarié en France** | Part des diplômés en emploi non salarié en France parmi l'ensemble des diplômés (actifs ou inactifs) |
| **Emploi stable** | Part des diplômés en emploi stable (CDI, fonctionnaires) |

L'insertion est mesurée à partir des DSN de juin (pour 12 et 24 mois) et de décembre
(pour 6, 18 et 30 mois), et du fichier annuel BNS pour l'emploi non salarié aux mêmes
dates. Compte tenu des dates de diplomation qui s'étalent de juin à la fin de l'année,
l'insertion « à 6 mois » correspond à une commodité de langage.

### Salaires

Les quartiles de salaire (Q1, médiane, Q3) sont disponibles à 6, 12, 18, 24 et 30 mois.
La rémunération exposée est un **salaire mensuel net équivalent temps plein** calculé à
partir des DSN.

### Ventilation par genre

Les indicateurs d'emploi et le nombre de sortants sont ventilés par genre (femmes,
hommes) pour chaque promotion.

## Utilisation dans DataFresq

Les données InserSup alimentent l'onglet
[« Insertion professionnelle »](/guide/formations/insertion) des fiches
formation ainsi que l'onglet
[« Insertion professionnelle »](/guide/espaces/insertion) des espaces de
travail.

Les indicateurs calculés à partir de ces données sont détaillés sur les pages :

- [Taux d'emploi](/guide/indicateurs/emploi) — formules et définitions
- [Données salariales](/guide/indicateurs/salaires) — quartiles et interprétation
- [Seuils de confidentialité](/guide/indicateurs/seuils) — conditions d'affichage



## Couverture et limites

- Le suivi repose sur les **DSN** (emploi salarié) et la **BNS** (emploi non salarié) :
  seul l'emploi en France est observable. Les diplômés travaillant à l'étranger ne sont
  pas captés par InserSup.
- Les données portent sur les **diplômés de nationalité française** (voir
  [Population étudiée](#population-étudiée)).
- L'appariement avec les formations [Fresq](/guide/donnees/fresq) repose sur les codes
  SISE et les identifiants de formation. Si ces codes sont absents, les données
  d'insertion ne peuvent pas être rattachées.
- Certains types de formations ne sont pas encore couverts par InserSup (formations
  courtes, certains diplômes d'établissement).

> [!WARNING]
> Les formations sans données InserSup n'affichent pas l'onglet « Insertion
> professionnelle » sur leur fiche. L'agrégation de plusieurs formations dans un
> [espace de travail](/guide/espaces/insertion) peut permettre d'atteindre
> les seuils de confidentialité même si les formations individuelles ne les atteignent pas.

## Fréquence de mise à jour

Les indicateurs d'insertion professionnelle sont calculés à un **rythme semestriel** par
le SIES. Chaque nouvelle campagne ajoute des échéances supplémentaires pour les cohortes
récentes et met à jour les données pour les cohortes précédentes. Les données sont
intégrées dans DataFresq après chaque publication.

> [!NOTE]
> **Qu'est-ce qu'une cohorte ?** Une cohorte (ou promotion) désigne
> l'ensemble des diplômés d'une même année. Par exemple, la « promotion 2020 » regroupe
> tous les étudiants ayant obtenu leur diplôme au cours de l'année universitaire
> 2019-2020. Les graphiques d'évolution permettent de comparer les taux d'emploi de
> différentes promotions à une même échéance.

> [!NOTE]
> Les promotions disponibles dans DataFresq sont indiquées dans les graphiques
> d'évolution. Si une promotion attendue n'apparaît pas, c'est que les données n'ont pas
> encore été intégrées lors de la dernière mise à jour de la plateforme.
