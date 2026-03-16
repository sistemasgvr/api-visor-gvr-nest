# Revisiones ACC — API (referencia para la vista de detalle)

La **Construction Reviews API** de Autodesk expone, entre otros:

| Uso | Método | Ruta (vía proxy Nest) |
|-----|--------|------------------------|
| Detalle de una revisión | `GET` | `/api/acc/projects/:projectId/reviews/:reviewId` |
| Workflow asociado a la revisión | `GET` | `/api/acc/projects/:projectId/reviews/:reviewId/workflow` |
| Progreso / pasos / actividad | `GET` | `/api/acc/projects/:projectId/reviews/:reviewId/progress` |
| Versiones (documentos vinculados) | `GET` | `/api/acc/projects/:projectId/reviews/:reviewId/versions` |

Documentación Autodesk:

- [Reviews API GA](https://aps.autodesk.com/blog/autodesk-construction-cloud-reviews-api-general-availability)
- [Reviews Write API](https://aps.autodesk.com/blog/autodesk-construction-cloud-reviews-write-api-and-updates)

Base URL Autodesk: `https://developer.api.autodesk.com/construction/reviews/v1/projects/{projectId}/reviews/...`

En una segunda fase del frontend se pueden unir en un solo “detalle” las respuestas de **review + workflow + progress + versions** y enriquecer con usuarios GVR (`accWorkflowCandidato`, `accRevision`).
