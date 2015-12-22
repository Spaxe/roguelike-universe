curl --request POST "https://api.digitalocean.com/v2/droplets" \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer $TOKEN" \
     --data '{
      "region":"sgp1",
      "image":"coreos-stable",
      "size":"512mb",
      "name":"rogue",
      "private_networking":true,
      "ssh_keys":['$SSH_KEY_ID'],
      "user_data": "'"$(cat cloud-config.yaml | sed 's/"/\\"/g')"'"
}'