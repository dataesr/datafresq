---
label: "Seuils de confidentialité"
title: "Seuils de confidentialité"
description: "Seuils minimum pour l'affichage des taux d'emploi et des salaires."
order: 4
keywords: [seuils, confidentialité, sortants, diplômés salariés, masqué, minimum, 20, 5]
---

Pour protéger la confidentialité des individus et garantir la fiabilité statistique des
indicateurs, certaines données ne sont affichées que lorsque l'échantillon est
suffisamment important. Deux seuils distincts sont appliqués.

## Seuils appliqués

| Indicateur | Seuil minimum | Population concernée | Justification |
|------------|---------------|----------------------|---------------|
| **Taux d'emploi** (salarié, non-salarié, stable) | ≥ 20 sortants | Diplômés sortants (non-poursuivants d'études) | Représentativité statistique et protection des individus |
| **Données salariales** (Q1, médiane, Q3) | ≥ 5 diplômés salariés | Diplômés pour lesquels un salaire est observé dans les DSN | Seuil plus bas car les données sont agrégées (quartiles) et non individuelles |

## Pourquoi deux seuils différents ?

Le seuil des taux d'emploi (20 sortants) est plus élevé que celui des salaires
(5 diplômés salariés) car les taux d'emploi sont des proportions calculées sur l'ensemble des
sortants. Un échantillon trop faible produirait des taux peu représentatifs : avec
10 sortants, un seul individu en plus ou en moins fait varier le taux de 10 points.

Les données salariales, en revanche, sont présentées sous forme de
[quartiles](/guide/indicateurs/salaires) (Q1, médiane, Q3). Ces
statistiques agrégées sont moins sensibles aux petits échantillons et ne révèlent pas de
valeurs individuelles. Un seuil de 5 diplômés salariés suffit à garantir qu'aucun salaire
individuel ne puisse être déduit des quartiles publiés. Les salaires sont observés
dans les déclarations sociales nominatives (DSN) et non déclarés par les diplômés
eux-mêmes.

## Comportement lorsqu'un seuil n'est pas atteint

Lorsque les données sont masquées en raison d'un seuil non atteint, DataFresq affiche un
message explicatif à la place des valeurs. Ce message indique :

- Le nombre réel de diplômés salariés ou de sortants disponibles
- Le seuil minimum requis pour l'affichage

Les graphiques et tableaux concernés affichent une mention « données insuffisantes » ou
« seuil non atteint » lorsque c'est le cas. Les onglets eux-mêmes restent visibles mais
peuvent ne contenir aucune donnée exploitable pour certaines cohortes ou échéances.

> [!NOTE]
> **Distinction importante :** un onglet
> *désactivé* (grisé) sur une [fiche formation](/guide/formations) signifie qu'aucune donnée de la
> source concernée n'existe pour cette formation (pas de codes SISE, pas de données
> InserSup, etc.). Un onglet *actif* mais avec des valeurs masquées signifie que
> les données existent mais que les seuils ne sont pas atteints pour certaines
> cohortes ou échéances.

## Impact sur les espaces de travail

L'agrégation de plusieurs formations dans un
[espace de travail](/guide/espaces/insertion) peut permettre d'atteindre les seuils
de confidentialité même si les formations individuelles ne les atteignent pas.

Concrètement, si une formation A compte 8 sortants et une formation B en compte 15,
aucune ne franchit le seuil de 20 individuellement. Mais dans un espace contenant les
deux formations, le total de 23 sortants dépasse le seuil et les taux d'emploi agrégés
peuvent être affichés.

> [!WARNING]
> **Conséquence pratique :** les espaces de travail sont un outil
> particulièrement utile pour analyser les petites formations dont les données
> individuelles sont masquées par les seuils. En regroupant des formations de même
> domaine, cycle ou académie, vous pouvez obtenir des indicateurs statistiquement
> exploitables là où les fiches individuelles ne le permettent pas.

## Effectifs étudiants

Les [effectifs étudiants](/guide/indicateurs/effectifs) (données SISE) ne
sont pas soumis à un seuil de confidentialité : dès qu'une inscription existe dans SISE
pour une formation, l'effectif est affiché. L'absence de données d'effectifs est liée à
un problème d'appariement (codes SISE manquants) et non à un seuil.

## Débouchés professionnels

Les [débouchés professionnels](/guide/formations/debouches) (données ROME et RNCP) ne sont pas soumis à un seuil non plus. Leur disponibilité dépend uniquement de
l'enregistrement de la formation au RNCP et de la présence de codes ROME dans la fiche
de certification.

## Résumé

| Type de données | Seuil | En cas de non-atteinte |
|-----------------|-------|------------------------|
| Effectifs étudiants (SISE) | Aucun | Onglet absent si pas de données SISE |
| Taux d'emploi (InserSup) | ≥ 20 sortants | Valeurs masquées, message explicatif |
| Quartiles de salaire (InserSup) | ≥ 5 diplômés salariés | Valeurs masquées, message explicatif |
| Débouchés (ROME/RNCP) | Aucun | Onglet absent si pas de codes RNCP |
