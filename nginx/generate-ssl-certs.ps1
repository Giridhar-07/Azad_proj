# Create directory for SSL certificates
New-Item -ItemType Directory -Force -Path .\ssl

# Generate self-signed SSL certificate for local development
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My"

# Export the certificate
$certPassword = ConvertTo-SecureString -String "password" -Force -AsPlainText
$certPath = "cert:\LocalMachine\My\$($cert.Thumbprint)"

# Export PFX
Export-PfxCertificate -Cert $certPath -FilePath .\ssl\server.pfx -Password $certPassword

# Export CRT
$cert | Export-Certificate -FilePath .\ssl\server.crt

# Convert PFX to PEM (key)
openssl pkcs12 -in .\ssl\server.pfx -nocerts -nodes -out .\ssl\server.key -password pass:password

# Remove the line containing "Bag Attributes"
(Get-Content .\ssl\server.key) | Select-String -Pattern "Bag Attributes" -NotMatch | Set-Content .\ssl\server.key

# Remove the private key header/footer lines
$keyContent = Get-Content .\ssl\server.key -Raw
$privateKeyPattern = "-----BEGIN PRIVATE KEY-----([\s\S]*)-----END PRIVATE KEY-----"
$privateKey = [regex]::Match($keyContent, $privateKeyPattern).Value
Set-Content -Path .\ssl\server.key -Value $privateKey

Write-Host "Self-signed SSL certificates generated successfully!"
Write-Host "Note: These certificates are for development purposes only."
Write-Host "For production, use proper certificates from a trusted CA."