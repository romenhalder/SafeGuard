# ============================================
# SAFEGUARD - Helm Common Templates
# Shared labels, annotations, selectors
# ============================================

{{/*
Expand the name of the chart.
*/}}
{{- define "safeguard.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "safeguard.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "safeguard.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{ include "safeguard.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: safeguard
environment: {{ .Values.environment | default "dev" }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "safeguard.selectorLabels" -}}
app.kubernetes.io/name: {{ include "safeguard.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Vault role name (matches K8s service account)
*/}}
{{- define "safeguard.vaultRole" -}}
{{ include "safeguard.fullname" . }}
{{- end }}

{{/*
Image tag
*/}}
{{- define "safeguard.imageTag" -}}
{{ .Values.image.tag | default .Chart.AppVersion }}
{{- end }}

{{/*
Namespace
*/}}
{{- define "safeguard.namespace" -}}
{{ .Values.namespace | default "safeguard-dev" }}
{{- end }}
