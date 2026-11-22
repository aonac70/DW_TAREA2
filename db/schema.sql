
CREATE TABLE IF NOT EXISTS usuarios (
    id               INTEGER      GENERATED ALWAYS AS IDENTITY,
    nombre           VARCHAR(100) NOT NULL,
    correo           VARCHAR(254) NOT NULL,
    contrasena_hash  VARCHAR(100) NOT NULL,
    rol              VARCHAR(20)  NOT NULL DEFAULT 'usuario',
    creado_en        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT usuarios_pk              PRIMARY KEY (id),
    CONSTRAINT usuarios_correo_unico    UNIQUE (correo),
    CONSTRAINT usuarios_correo_minuscula CHECK (correo = lower(correo)),
    CONSTRAINT usuarios_nombre_no_vacio CHECK (btrim(nombre) <> ''),
    CONSTRAINT usuarios_rol_valido      CHECK (rol IN ('usuario', 'administrador'))
);


CREATE TABLE IF NOT EXISTS productos (
    id              INTEGER       GENERATED ALWAYS AS IDENTITY,
    nombre          VARCHAR(120)  NOT NULL,
    descripcion     VARCHAR(1000) NOT NULL,
    categoria       VARCHAR(60)   NOT NULL,
    precio          NUMERIC(10,2) NOT NULL,
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT productos_pk                  PRIMARY KEY (id),
    CONSTRAINT productos_precio_positivo     CHECK (precio > 0),
    CONSTRAINT productos_nombre_no_vacio     CHECK (btrim(nombre) <> ''),
    CONSTRAINT productos_descripcion_no_vacia CHECK (btrim(descripcion) <> ''),
    CONSTRAINT productos_categoria_no_vacia  CHECK (btrim(categoria) <> '')
);


CREATE UNIQUE INDEX IF NOT EXISTS productos_nombre_unico ON productos (lower(nombre));


CREATE INDEX IF NOT EXISTS productos_categoria_idx ON productos (lower(categoria));


CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id   INTEGER     NOT NULL,
    producto_id  INTEGER     NOT NULL,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT favoritos_pk          PRIMARY KEY (usuario_id, producto_id),
    CONSTRAINT favoritos_usuario_fk  FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)  ON DELETE CASCADE,
    CONSTRAINT favoritos_producto_fk FOREIGN KEY (producto_id)
        REFERENCES productos (id) ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS favoritos_producto_idx ON favoritos (producto_id);
