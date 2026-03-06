---
label: "Indicateurs et méthodologie"
title: "Indicateurs et méthodologie"
description: "Cette section détaille les méthodes de calcul des indicateurs affichés dans DataFresq,
les règles d'agrégation appliquées dans les espaces de travail et les seuils de
confidentialité qui conditionnent l'affichage des données."
icon: "fr-icon-line-chart-line"
order: 5
keywords: [indicateurs, méthodologie, calcul, formule, seuil]
---

Ces pages servent de référence partagée : elles décrivent **comment** les indicateurs
sont calculés, indépendamment du contexte d'affichage
([fiche formation](/guide/formations) ou
[espace de travail](/guide/espaces)).

## Résumé des formules

| Indicateur | Formule | Agrégation espace |
|------------|---------|-------------------|
| Effectif total | Somme des inscriptions principales | Somme sur toutes les formations |
| Taux de féminisation | (Femmes / Effectif total) × 100 | (Σ Femmes / Σ Effectif total) × 100 |
| Taux d'emploi salarié | (Sortants en emploi / Sortants) × 100 | Moyenne pondérée par nombre de sortants |
| Taux d'emploi stable | (Emplois stables / Emplois salariés) × 100 | Moyenne pondérée par nombre de sortants |
| Salaire médian | Q2 (50e percentile des salaires observés) | Recalculé sur l'ensemble agrégé |

## Seuils de confidentialité

| Indicateur | Seuil minimum | Justification |
|------------|---------------|---------------|
| Taux d'emploi | ≥ 20 sortants | Représentativité statistique |
| Données salariales | ≥ 5 diplômés salariés | Agrégation en quartiles, pas de valeurs individuelles |
| Effectifs étudiants | Aucun | Données agrégées non nominatives |
| Débouchés (ROME/RNCP) | Aucun | Données de référentiel, pas de données individuelles |

Pour le détail, consultez la page [Seuils de confidentialité](/guide/indicateurs/seuils).

## Données manquantes

Plusieurs raisons peuvent expliquer l'absence de données pour une formation ou un
indicateur donné :

| Situation | Indicateurs impactés | Explication |
|-----------|---------------------|-------------|
| **Formation récente** | Effectifs, Insertion | Les données SISE ou InserSup ne sont pas encore disponibles. Les données SISE arrivent avec un décalage d'un an, et les données InserSup nécessitent plusieurs mois après le diplôme. |
| **Effectifs insuffisants** | Insertion, Salaires | Le nombre de sortants ou de diplômés salariés est inférieur aux [seuils de confidentialité](/guide/indicateurs/seuils). |
| **Appariement impossible** | Effectifs, Insertion | La formation ne dispose pas des codes nécessaires pour être reliée aux bases de données sources. |
| **Formation non couverte** | Insertion | Certains types de formations ne sont pas couverts par le dispositif InserSup (formations courtes, certains diplômes d'établissement, etc.). |
| **Pas de certification RNCP** | Débouchés (ROME) | La formation n'est pas enregistrée au RNCP. Sans code RNCP, aucun lien vers les métiers ROME ne peut être établi. |
| **Accréditation expirée** | Tous (potentiellement) | Les formations dont l'accréditation a expiré peuvent progressivement perdre leurs données lorsque les dernières cohortes de diplômés ont été suivies. |

## Sources de données

Chaque indicateur s'appuie sur une source de données spécifique :

| Indicateur | Source | Page de référence |
|------------|--------|-------------------|
| Effectifs, féminisation | SISE | [Source SISE](/guide/donnees/sise) |
| Taux d'emploi, salaires | InserSup | [Source InserSup](/guide/donnees/insersup) |
| Débouchés professionnels | ROME / RNCP | [Source ROME et RNCP](/guide/donnees/rome) |
