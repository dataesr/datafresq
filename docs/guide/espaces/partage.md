---
label: "Partage et collaboration"
title: "Partage et collaboration"
description: "Invitez des collaborateurs avec les rôles propriétaire, éditeur ou lecteur."
order: 4
keywords: [partage, collaboration, inviter, rôle, propriétaire, éditeur, lecteur, public]
---

Vous pouvez inviter d'autres utilisateurs à accéder à vos espaces de travail. Chaque
collaborateur se voit attribuer un rôle qui détermine ses permissions.

## Rôles dans un espace

Les rôles au sein d'un espace de travail sont indépendants des
[rôles plateforme](/guide/administration/roles) (utilisateur /
administrateur). Un administrateur de la plateforme n'a pas automatiquement accès à
tous les espaces.

| Rôle | Consultation | Modifier les formations | Voir l'historique | Gérer les paramètres |
|------|:------------:|:----------------------:|:-----------------:|:--------------------:|
| **Propriétaire** | ✓ | ✓ | ✓ | ✓ |
| **Éditeur** | ✓ | ✓ | ✓ | — |
| **Lecteur** | ✓ | — | — | — |

## Inviter un collaborateur

Depuis l'onglet [Paramètres](/guide/espaces/parametres) de votre espace,
section **« Collaborateurs »**, recherchez l'utilisateur par son adresse
email. Sélectionnez le rôle à lui attribuer (lecteur ou éditeur), puis validez
l'invitation.

Le collaborateur verra immédiatement l'espace apparaître dans la section
**« Partagés avec moi »** de son menu latéral.

> [!NOTE]
> Vous pouvez également inviter des collaborateurs directement lors de la
> [création de l'espace](/guide/espaces/creer), via le champ
> « Collaborateurs » du formulaire.

## Modifier ou retirer un collaborateur

Le propriétaire de l'espace peut à tout moment modifier le rôle d'un collaborateur
(passer de lecteur à éditeur, ou inversement) ou le retirer de l'espace depuis l'onglet
**Paramètres**.

## Quitter un espace partagé

Si vous êtes collaborateur d'un espace (lecteur ou éditeur), vous pouvez quitter
l'espace à tout moment en cliquant sur **« Quitter l'espace »** sur la
page de l'espace. Vous perdrez immédiatement l'accès aux données de cet espace.

## Espaces publics

Un espace peut être rendu **public** par son propriétaire. Un espace public
est visible en lecture seule par tous les utilisateurs connectés à la plateforme, sans
qu'une invitation soit nécessaire.

Seuls les collaborateurs invités explicitement (éditeurs) peuvent modifier les formations
d'un espace public. Les autres utilisateurs ne peuvent que consulter les données.

> [!WARNING]
> **Attention :** rendre un espace public signifie que tous les utilisateurs
> de DataFresq pourront voir son contenu, y compris le nom, la description et les
> formations qu'il contient. Vérifiez qu'aucune information sensible n'y figure avant
> d'activer la visibilité publique.