---
label: "Taux d'emploi"
title: "Taux d'emploi"
description: "Emploi salarié, non salarié, stable et échéances de mesure."
order: 2
keywords: [emploi, salarié, stable, CDI, échéance, M+6, M+12, M+18, M+24, M+30]
---

Les données d'emploi proviennent du dispositif
[InserSup](/guide/donnees/insersup). Cette page détaille les formules de
calcul et les règles d'agrégation utilisées sur les
[fiches formation](/guide/formations/insertion) et dans les
[espaces de travail](/guide/espaces/insertion).

## Population de référence

Les taux d'emploi sont calculés sur les **sortants** : les diplômés entrés sur
le marché du travail, par opposition aux poursuivants d'études. Seuls les diplômés de
nationalité française en formation initiale sont pris en compte.

## Taux d'emploi salarié en France

`Taux d'emploi salarié = (Nombre de sortants en emploi salarié / Nombre de sortants) × 100`

Ce taux mesure la part des diplômés sortants occupant un emploi salarié en France à une
échéance donnée après le diplôme. Il s'agit de l'indicateur principal d'insertion
professionnelle.

## Taux d'emploi non salarié

Part des diplômés sortants exerçant une activité indépendante : travailleurs indépendants,
auto-entrepreneurs, professions libérales. Cet indicateur complète le taux d'emploi salarié
pour donner une vision plus complète de l'insertion.

## Taux d'emploi stable

`Taux d'emploi stable = (Emplois stables / Emplois salariés) × 100`

Part des emplois « stables » (CDI, fonctionnaires) parmi l'ensemble des emplois salariés.
Cet indicateur mesure la **qualité** de l'insertion, pas seulement le fait
d'être en emploi. Un taux d'emploi stable élevé indique que les diplômés accèdent
rapidement à des contrats pérennes.

## Échéances de mesure

Chaque indicateur est mesuré à plusieurs échéances après l'obtention du diplôme :

| Échéance | Signification |
|----------|---------------|
| **M+6** | 6 mois après le diplôme |
| **M+12** | 12 mois après le diplôme |
| **M+18** | 18 mois après le diplôme |
| **M+24** | 24 mois après le diplôme |
| **M+30** | 30 mois après le diplôme |

En règle générale, les taux d'emploi augmentent avec le temps : un diplômé a plus de
chances d'être en emploi 30 mois après son diplôme que 6 mois après. Les graphiques
d'évolution permettent de comparer les taux de différentes promotions à une même échéance.

## Agrégation dans les espaces de travail

Dans un [espace de travail](/guide/espaces/insertion), les taux d'emploi sont
calculés comme des **moyennes pondérées par le nombre de sortants** de chaque
formation. Cela garantit que les formations avec davantage de diplômés pèsent
proportionnellement plus dans le résultat agrégé.

`Taux agrégé = Σ(Taux_i × Sortants_i) / Σ Sortants_i`

> [!WARNING]
> **Exemple :** une formation A avec un taux d'emploi de 90 % sur 200
> sortants et une formation B avec un taux de 70 % sur 50 sortants donneront un taux
> agrégé de (90 × 200 + 70 × 50) / (200 + 50) = 86 %, et non la moyenne arithmétique
> (90 + 70) / 2 = 80 %.

## Seuils d'affichage

Les taux d'emploi ne sont affichés que lorsque le nombre de sortants atteint un minimum de
**20** pour la formation et l'échéance concernées. En dessous de ce seuil, les
données sont masquées pour garantir la représentativité statistique et protéger la
confidentialité des individus.

Pour en savoir plus, consultez la page
[Seuils de confidentialité](/guide/indicateurs/seuils).

## Disponibilité des données

Les taux d'emploi ne sont disponibles que pour les formations disposant de données
[InserSup](/guide/donnees/insersup). L'agrégation de plusieurs formations
dans un [espace de travail](/guide/espaces/insertion) peut permettre
d'atteindre les seuils même si les formations individuelles ne les atteignent pas.