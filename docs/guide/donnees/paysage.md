---
label: "Paysage"
title: "Paysage"
description: "Référentiel des établissements du MESRE : suivi dans le temps, successions et appariement des données."
order: 4
keywords: [Paysage, établissements, UAI, BCE, appariement, identifiant, fusion, succession]
---

**Paysage** est un système d'information du ministère de l'Enseignement supérieur, de
la Recherche et de l'Espace (MESRE) qui assure le suivi des établissements d'enseignement supérieur et
de recherche dans le temps. Il constitue un maillon essentiel de DataFresq pour relier
les formations à leurs données statistiques.

## Pourquoi Paysage ?

Les sources de données statistiques de l'enseignement supérieur
([SISE](/guide/donnees/sise), [InserSup](/guide/donnees/insersup))
identifient historiquement les établissements via les **codes UAI** issus de la Base
Centrale des Établissements (BCE). Or, la BCE présente des limites importantes pour
un suivi fiable dans le temps :

- Les codes UAI peuvent changer lors de fusions, scissions ou restructurations
  d'établissements
- Un même établissement peut posséder plusieurs UAI (un par site, par composante, etc.)
- Lorsqu'un établissement fusionne ou se divise, le lien entre les anciens et nouveaux
  codes UAI n'est pas toujours tracé dans la BCE

Ces limites rendent les appariements entre les formations [Fresq](/guide/donnees/fresq)
et les données SISE ou InserSup fragiles dès lors que l'on souhaite suivre une formation
dans le temps ou couvrir les réorganisations institutionnelles.

Paysage résout ce problème en attribuant à chaque établissement un **identifiant stable**
(`id_paysage`) et en traçant explicitement les successions, fusions et intégrations
d'établissements.

## Suivi des successions et fusions

Paysage enregistre l'historique des transformations institutionnelles :

- **Fusions** — lorsque plusieurs établissements fusionnent en un seul (par exemple la
  création d'une université expérimentale regroupant plusieurs universités), Paysage
  conserve le lien entre les anciens identifiants et le nouvel établissement
- **Scissions** — lorsqu'un établissement se divise, chaque entité résultante est reliée
  à l'établissement d'origine
- **Intégrations** — lorsqu'un établissement est absorbé par un autre, Paysage
  enregistre cette relation

Cette traçabilité permet de reconstituer l'historique complet d'un établissement, même
à travers des réorganisations successives.

> [!NOTE]
> **Exemple concret :** une université créée en 2020 par fusion de deux universités
> existantes possède un nouvel `id_paysage`. Grâce aux liens de succession, DataFresq
> peut rattacher à cette nouvelle université les données SISE des deux universités
> d'origine pour les années antérieures à la fusion. Sans Paysage, ces données
> historiques seraient perdues, car les anciens codes UAI ne correspondent plus à
> l'établissement actuel.

## Rôle dans DataFresq

Grâce à Paysage, DataFresq peut :

- **Afficher l'historique complet** des effectifs et de l'insertion pour une formation,
  y compris sur des années où l'établissement porteur n'existait pas encore sous sa
  forme actuelle
- **Agréger correctement les données** dans les
  [espaces de travail](/guide/espaces), en tenant compte des
  réorganisations institutionnelles
- **Ventiler les effectifs par établissement** dans les espaces de travail en utilisant
  le nom actuel des établissements, même pour des données anciennes
