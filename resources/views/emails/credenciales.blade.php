<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Credenciales de acceso</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; }
    .wrapper { max-width: 580px; margin: 40px auto; padding: 0 16px; }
    .card { background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%); padding: 36px 40px; text-align: center; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; color: #374151; margin: 0 0 20px; }
    .info-box { background: #F0F4FF; border: 1px solid #DBEAFE; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
    .info-box .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6B7280; margin: 0 0 4px; }
    .info-box .value { font-size: 15px; color: #111827; font-weight: 500; margin: 0 0 16px; word-break: break-all; }
    .info-box .value:last-child { margin-bottom: 0; }
    .password-value { font-family: 'Courier New', monospace; font-size: 22px; font-weight: 700; color: #1D4ED8; letter-spacing: 2px; background: #EFF6FF; padding: 10px 16px; border-radius: 8px; display: inline-block; margin: 4px 0 0; }
    .notice { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin: 24px 0; font-size: 13px; color: #92400E; }
    .notice strong { color: #78350F; }
    .btn-wrap { text-align: center; margin: 28px 0 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .footer { padding: 20px 40px 32px; text-align: center; }
    .footer p { font-size: 12px; color: #9CA3AF; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <p>Sistema de Seguimiento a la Trayectoria Escolar</p>
      </div>

      <div class="body">
        <p class="greeting">Hola, <strong>{{ $user->name }}</strong>.</p>

        <p style="font-size:15px;color:#374151;margin:0 0 6px;">
          Se ha creado tu cuenta en el sistema. A continuación encontrarás tus credenciales de acceso:
        </p>

        <div class="info-box">
          <p class="label">Correo electrónico</p>
          <p class="value">{{ $user->email }}</p>

          <p class="label">Contraseña temporal</p>
          <div class="password-value">{{ $passwordTemporal }}</div>
        </div>

        <div class="notice">
          <strong>Importante:</strong> esta es una contraseña temporal. Al ingresar por primera vez al sistema se te pedirá que establezcas una nueva contraseña personal.
        </div>

        <div class="btn-wrap">
          <a href="{{ config('app.url') }}/login" class="btn">Ingresar al sistema</a>
        </div>
      </div>

      <div class="footer">
        <p>Si no reconoces esta cuenta, ignora este mensaje.</p>
        <p style="margin-top:6px;">© {{ date('Y') }} {{ config('app.name') }}</p>
      </div>

    </div>
  </div>
</body>
</html>
