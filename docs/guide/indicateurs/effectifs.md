---
label: "Effectifs"
title: "Effectifs"
description: "Calcul de l'effectif total et du taux de féminisation."
order: 1
keywords: [effectifs, féminisation, inscriptions, genre, femmes, hommes, taux, SISE, inscriptions principales]
---

Les effectifs étudiants et le taux de féminisation sont calculés à partir des données
d'inscription issues du système [SISE](/guide/donnees/sise). Cette page
détaille les méthodes de calcul utilisées sur les
[fiches formation](/guide/formations/effectifs) et dans les
[espaces de travail](/guide/espaces/effectifs).

## Calcul de l'effectif total

L'effectif total correspond à la somme des inscriptions principales (y compris doubles
inscriptions CPGE) enregistrées pour une formation au cours d'une année universitaire
donnée.

DataFresq utilise les inscriptions principales **y compris doubles inscriptions CPGE**
(variable SISE `effectif`) enregistrées pour une formation au cours d'une année universitaire
donnée. Ce périmètre inclut donc les étudiants de CPGE inscrits en
parallèle à l'université. Il convient d'en tenir compte lors de l'analyse des évolutions
à partir de 2018-2019 : une partie de la hausse des effectifs observée en licence peut
être liée à l'extension progressive de ces conventions et non à une augmentation réelle
du nombre d'étudiants.

> [!INFO]
> Les **effectifs** affichés dans DataFresq reposent sur la notion d'**inscription principale**
> définie par SISE. Un même étudiant peut prendre plusieurs inscriptions administratives
> dans un ou plusieurs établissements. Lorsqu'un étudiant possède plusieurs inscriptions
> au sein d'un même établissement, une seule est déclarée « principale », les autres sont
> déclarées « secondes ». La notion d'inscription principale permet ainsi de dénombrer les
> étudiants en personnes physiques, sans double compte au sein d'un même établissement.

> [!WARNING]
> **Inscriptions ≠ individus :** un étudiant inscrit à titre principal dans
> deux formations de deux établissements différents est compté une fois par formation.
> Les effectifs comptabilisent les inscriptions principales, pas les individus uniques à
> l'échelle nationale.

## Répartition par genre et taux de féminisation

Les effectifs sont ventilés par genre (femmes et hommes) pour chaque année universitaire.

Le taux de féminisation est calculé selon la formule suivante :

`Taux de féminisation = (Nombre de femmes / Effectif total) × 100`

Ce taux est exprimé en pourcentage et calculé pour chaque année universitaire.

## Agrégation dans les espaces de travail

Dans un [espace de travail](/guide/espaces/effectifs), les effectifs de
toutes les formations sont additionnés pour chaque année universitaire.

> [!WARNING]
> **Inscriptions ≠ individus :** la notion d'inscription principale permet de dénombrer les
> étudiants en personnes physiques, sans double compte au sein d'un même établissement,
> pas lorsqu'on agrège les effectifs de formations d'établissements différents.
> Un étudiant inscrit à titre principal dans
> deux formations de deux établissements différents est compté une fois par formation.
> Les effectifs comptabilisent les inscriptions principales, pas les individus uniques à
> l'échelle nationale.

Le taux de féminisation est
recalculé sur l'ensemble des formations agrégées :

`Taux de féminisation (espace) = (Σ Femmes / Σ Effectif total) × 100`

Il s'agit bien de la somme des femmes inscrites dans toutes les formations de l'espace,
divisée par la somme totale des inscriptions — et non d'une moyenne des taux de
féminisation individuels. Cette méthode garantit que les formations à fort effectif pèsent
proportionnellement plus dans le résultat.

> [!NOTE]
> **Exemple :** une formation A avec 100 inscriptions (60 femmes, soit 60 %)
> et une formation B avec 1 000 inscriptions (400 femmes, soit 40 %) donneront un taux de
> féminisation agrégé de (60 + 400) / (100 + 1 000) × 100 = 41,8 %, et non la moyenne
> arithmétique (60 + 40) / 2 = 50 %.

## Disponibilité des données

Les effectifs ne sont disponibles que pour les formations disposant de données
[SISE](/guide/donnees/sise). L'appariement repose sur les codes SISE
associés à la formation et ses parcours dans le référentiel
[Fresq](/guide/donnees/fresq).

Les effectifs étudiants ne sont pas soumis à un seuil de confidentialité : dès qu'une
inscription existe dans SISE pour une formation, l'effectif est affiché. L'absence de
données est liée à un problème d'appariement (codes SISE manquants) et non à un seuil.