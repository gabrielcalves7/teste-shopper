## API para Leitura de Medidores

Esta API provê funcionalidades para carregar imagens de medidores (água/gás), realizar a leitura via LLM e confirmar as leituras.

Antes de prosseguir, lembre-se de configurar o .env adequadamente, temos um exemplo no projeto, o arquivo **.env.example**

### Rotas

#### `POST /upload`

Carrega uma imagem de um medidor, realiza uma consulta a uma LLM para extrair o valor da leitura e salva os dados da medição.

**Entrada:**

```json
{
  "image": "data:image/jpeg;base64,...", // Imagem em base64
  "customer_code": "customer123", 
  "measure_datetime": "2024-03-10T10:00:00.000Z", 
  "measure_type": "WATER" // ou "GAS"
}
```

**Retorno:**

* **Sucesso (200 OK):**
  ```json
  {
    "image_url": "/images/image_name.jpg",
    "measure_value": 123.45, 
    "measure_uuid": "uuid-da-medicao" 
  }
  ```

* **Erro (400 Bad Request):**
    * `INVALID_DATA`: Dados de entrada inválidos.
    * `DOUBLE_REPORT`: Já existe uma leitura para este mês.

#### `PATCH /confirm`

Confirma uma leitura previamente realizada.

**Entrada:**

```json
{
  "measure_uuid": "uuid-da-medicao", 
  "confirmed_value": 123.45 
}
```

**Retorno:**

* **Sucesso (200 OK):**
  ```json
  {
    "success": true
  }
  ```

* **Erro (400 Bad Request):**
    * `INVALID_DATA`: Dados de entrada inválidos.
    * `MEASURE_NOT_FOUND`:  Leitura não encontrada.
    * `CONFIRMATION_DUPLICATE`: Leitura do mês já realizada.

#### `GET /:customer_code/list`

Lista as leituras de um cliente.

**Parâmetros de URL:**

* `customer_code`: Código do cliente.

**Parâmetros de Consulta (Query String):**

* `measure_type` (opcional): Tipo de medição ("WATER" ou "GAS").

**Retorno:**

* **Sucesso (200 OK):**
  ```json
  {
    "customer_code": "customer123",
    "measures": [
      {
        "measure_uuid": "uuid-da-medicao",
        "measure_datetime": "2024-03-10T10:00:00.000Z",
        "measure_type": "WATER", 
        "has_confirmed": false, 
        "image_url": "/images/image_name.jpg" 
      },
    ]
  }
  ```

* **Erro (400 Bad Request):**
    * `INVALID_TYPE`: Tipo de medição inválido.

* **Erro (404 Not Found):**
    * `NOT_FOUND`: Nenhum registro encontrado para o `customer_code`.


## Rodando com Docker

### Pré-requisitos

* Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
* Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

### Passos

1. **Construir a Imagem Docker:**
   ```bash
   docker-compose build
   ```

2. **Iniciar os Containers:**
   ```bash
   docker-compose up -d 
   ```

3. **Acessar a API:**
   A API estará disponível em `http://localhost:9000` (ou na porta especificada no seu arquivo `docker-compose.yml`).


## Exemplos de Uso

**Carregar uma Imagem:**

```bash
curl -X POST http://localhost:9000/upload \
  -H 'Content-Type: application/json' \
  -d '{
    "image": "data:image/jpeg;base64,...",
    "customer_code": "customer123",
    "measure_datetime": "2024-03-10T10:00:00.000Z",
    "measure_type": "WATER"
  }'
```

**Confirmar uma Leitura:**

```bash
curl -X PATCH http://localhost:9000/confirm \
  -H 'Content-Type: application/json' \
  -d '{
    "measure_uuid": "uuid-da-medicao",
    "confirmed_value": 123.45
  }'
```

**Listar Leituras:**

```bash
curl http://localhost:9000/customer123/list
```

**Listar Leituras (apenas de Água):**

```bash
curl http://localhost:9000/customer123/list?measure_type=WATER
```