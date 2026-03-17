---
label: "Sources de données"
title: "Sources de données"
description: "dataFresq agrège plusieurs sources de données officielles du Ministère de l'Enseignement
Supérieur et de la Recherche et de l'Espace (MESRE) et de France Travail. Cette page présente une vue
d'ensemble de chaque source et de leur articulation"
icon: "fr-icon-database-line"
order: 4
keywords: [sources, données, Fresq, SISE, InserSup, Paysage, ROME, RNCP]
---

Comprenez d'où proviennent les données affichées : Fresq, SISE, InserSup, Paysage, ROME

## Vue d'ensemble

| Source | Producteur | Contenu principal | Fréquence |
|--------|------------|-------------------|-----------|
| **Fresq** | MESRE | Référentiel des formations (identité, accréditations) | Continue |
| **SISE** | MESRE | Effectifs étudiants (inscriptions, genre, géographie) | Annuelle |
| **InserSup** | MESRE | Insertion professionnelle (emploi, salaires) | Semestrielle |
| **Paysage** | MESRE | Référentiel des établissements (suivi dans le temps, successions) | Continue |
| **ROME** | France Travail | Répertoire des métiers et emplois | Continue |
| **RNCP** | France Compétences | Certifications professionnelles (lien formation → métiers) | Continue |

## Appariement entre les sources

dataFresq croise ces différentes sources de données en s'appuyant sur des identifiants
communs :

| Lien | Identifiant utilisé |
|------|---------------------|
| Fresq → SISE | Codes SISE associés à la formation et ses parcours |
| Fresq → InserSup | Codes SISE et identifiants de formation |
| Fresq → RNCP | Codes RNCP associés à la formation et ses parcours |
| RNCP → ROME | Codes ROME référencés dans la fiche RNCP |

### Rôle de Paysage dans les appariements

Les sources statistiques (SISE, InserSup) identifient les établissements via des codes
UAI issus de la Base Centrale des Établissements (BCE). Or, ces codes changent lors de
fusions, scissions ou restructurations, ce qui fragilise les liens entre formations et
données statistiques dans le temps.

[Paysage](/guide/donnees/paysage) résout ce problème en attribuant à chaque
établissement un identifiant stable (`id_paysage`) et en traçant les successions et
fusions. Les données SISE et InserSup intègrent ces identifiants Paysage, ce qui permet
à dataFresq de rattacher les données historiques à la bonne formation même lorsque
l'établissement porteur a été réorganisé.

Lorsqu'un appariement ne peut pas être établi (code manquant, formation non couverte),
les données correspondantes ne sont pas affichées. Consultez la page
[Indicateurs — Données manquantes](/guide/indicateurs#données-manquantes) pour comprendre
pourquoi certaines formations n'ont pas toutes les informations.
