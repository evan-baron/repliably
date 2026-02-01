{{/*
Expand the name of the chart.
*/}}
{{- define "application-automation.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "application-automation.fullname" -}}
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
Create chart name and version as used by the chart label.
*/}}
{{- define "application-automation.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "application-automation.labels" -}}
helm.sh/chart: {{ include "application-automation.chart" . }}
{{ include "application-automation.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "application-automation.selectorLabels" -}}
app.kubernetes.io/name: {{ include "application-automation.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "application-automation.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "application-automation.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the database URL
*/}}
{{- define "application-automation.databaseUrl" -}}
{{- printf "postgresql://%s:$(DATABASE_PASSWORD)@%s:%d/%s" .Values.database.user .Values.database.host (int .Values.database.port) .Values.database.name }}
{{- end }}

{{/*
Get the secret name for application secrets
*/}}
{{- define "application-automation.secretName" -}}
{{- if .Values.secrets.create }}
{{- include "application-automation.fullname" . }}
{{- else }}
{{- .Values.secrets.existingSecret }}
{{- end }}
{{- end }}

{{/*
Get the secret name for database password
*/}}
{{- define "application-automation.databaseSecretName" -}}
{{- if .Values.database.existingSecret }}
{{- .Values.database.existingSecret }}
{{- else }}
{{- include "application-automation.fullname" . }}-db
{{- end }}
{{- end }}
