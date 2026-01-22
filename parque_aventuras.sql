-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-01-2026 a las 22:53:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `parque_aventuras`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_pagos`
--

CREATE TABLE `aplicaciones_pagos` (
  `id` int(11) NOT NULL,
  `pago_id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `monto_aplicado` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aplicaciones_pagos`
--

INSERT INTO `aplicaciones_pagos` (`id`, `pago_id`, `factura_id`, `monto_aplicado`, `created_at`, `updated_at`) VALUES
(34, 41, 69, 5000.00, '2026-01-19 20:16:39', '2026-01-19 20:16:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_pagos_compras`
--

CREATE TABLE `aplicaciones_pagos_compras` (
  `id` int(11) NOT NULL,
  `pago_id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `monto_aplicado` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulos`
--

CREATE TABLE `articulos` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `precio` decimal(10,4) NOT NULL,
  `iva_id` int(11) NOT NULL,
  `descuentos` varchar(150) NOT NULL,
  `precio_neto` decimal(10,4) NOT NULL,
  `utilidad` decimal(10,4) NOT NULL,
  `precio_venta` decimal(10,4) NOT NULL,
  `maneja_stock` decimal(10,4) NOT NULL,
  `nota` text NOT NULL,
  `familia_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `clasificacion_id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `centro_costo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `articulos`
--

INSERT INTO `articulos` (`id`, `descripcion`, `precio`, `iva_id`, `descuentos`, `precio_neto`, `utilidad`, `precio_venta`, `maneja_stock`, `nota`, `familia_id`, `categoria_id`, `clasificacion_id`, `codigo`, `centro_costo_id`) VALUES
(6, 'CUMPLEAÑOS', 500.0000, 1, '', 500.0000, 30.0000, 5000.0000, 0.0000, '', 1, 1, 1, NULL, 1),
(8, 'TREKING', 1.0000, 1, '[\"-10\"]', 2.0000, 3.0000, 4000.0000, 0.0000, 'nota', 1, 1, 1, NULL, 4),
(12, 'JUBILADOS12', 100.0000, 1, '-10,-20', 500.0000, 150.0000, 15000.0000, 0.0000, 'FSDFSDFSDF', 1, 2, 1, NULL, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulos_compras`
--

CREATE TABLE `articulos_compras` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `iva` decimal(10,2) NOT NULL DEFAULT 21.00,
  `id_centro-costo` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `articulos_compras`
--

INSERT INTO `articulos_compras` (`id`, `codigo`, `descripcion`, `iva`, `id_centro-costo`, `created_at`, `updated_at`) VALUES
(1, 'A-100', 'Resma A4 80g', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:41'),
(2, 'A-101', 'Tóner HP 85A', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:43'),
(3, 'A-102', 'Lapicera Azul Bic', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:44'),
(4, 'B-200', 'Caja de Guantes Nitrilo', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:46'),
(5, 'B-201', 'Alcohol Etílico 1L', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:47'),
(6, 'B-202', 'Barbijo Tricapa', 21.00, 1, '2026-01-01 15:33:14', '2026-01-20 20:09:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bancos`
--

CREATE TABLE `bancos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `sucursal` varchar(100) NOT NULL,
  `nro_cuenta` varchar(100) NOT NULL,
  `cbu` varchar(100) NOT NULL,
  `alias` int(100) NOT NULL,
  `nota` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bancos`
--

INSERT INTO `bancos` (`id`, `nombre`, `sucursal`, `nro_cuenta`, `cbu`, `alias`, `nota`) VALUES
(1, 'BANCO CORDOBA', 'sdfsdf', 'sdfsf', 'sdfsf', 0, 'sdfsfsf');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja`
--

CREATE TABLE `caja` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `apertura` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cierre` decimal(12,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja_movimientos`
--

CREATE TABLE `caja_movimientos` (
  `id` int(11) NOT NULL,
  `caja_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `tipo` enum('INGRESO','EGRESO') NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `gasto_id` int(11) DEFAULT NULL,
  `venta_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'categoria 1'),
(2, 'categoria 2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_gastos`
--

CREATE TABLE `categorias_gastos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centros_costos`
--

CREATE TABLE `centros_costos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `centros_costos`
--

INSERT INTO `centros_costos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Cumpleaños', 'Eventos de cumpleaños'),
(2, 'Educativo', 'Educativo'),
(3, 'Estudiantil', 'Estudiantil'),
(4, 'Treking', 'Treking'),
(5, 'Gestion', 'Gestion'),
(6, 'Administracion Comercial', 'Administracion Comercial'),
(7, 'Bar 1', 'Bar 1'),
(8, 'Bar 2', 'Bar 2'),
(9, 'Inverciones', 'Inverciones'),
(10, 'Mantenimiento', 'Mantenimiento'),
(11, 'Taller Muñecos', 'Taller Muñecos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificaciones`
--

CREATE TABLE `clasificaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clasificaciones`
--

INSERT INTO `clasificaciones` (`id`, `nombre`) VALUES
(1, 'clasificacion 1'),
(2, 'clasificacion 2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `cuit` varchar(20) DEFAULT NULL,
  `iva` varchar(50) DEFAULT NULL,
  `iibb` varchar(50) DEFAULT NULL,
  `numiibb` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nota` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `dni`, `cuit`, `iva`, `iibb`, `numiibb`, `direccion`, `telefono`, `email`, `nota`, `created_at`, `updated_at`) VALUES
(1, 'Deeo', 'Raiser', '34562707', '20345627074', '', '', '', 'Av Colon 889', '', 'deeonrn@gmail.com', '', '2025-11-27 16:04:19', NULL),
(2, 'CONSUMIDOR FINAL ', 'GENERICO', '', '', '', '', '', '', '', '', '', '2025-11-27 16:04:19', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas_bancarias`
--

CREATE TABLE `cuentas_bancarias` (
  `id` int(11) NOT NULL,
  `banco_id` int(11) NOT NULL,
  `numero_cuenta` varchar(50) DEFAULT NULL,
  `tipo` varchar(30) DEFAULT NULL,
  `alias_cbu` varchar(50) DEFAULT NULL,
  `cbu` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuentas_bancarias`
--

INSERT INTO `cuentas_bancarias` (`id`, `banco_id`, `numero_cuenta`, `tipo`, `alias_cbu`, `cbu`) VALUES
(1, 1, '12121212121', 'CC', 'ALIAS CBU', '99999999999999999999999999999999');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cupones_tarjeta`
--

CREATE TABLE `cupones_tarjeta` (
  `id` int(11) NOT NULL,
  `tarjeta_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `monto_total` decimal(12,2) NOT NULL,
  `nro_cupon` varchar(50) DEFAULT NULL,
  `nro_lote` varchar(50) DEFAULT NULL,
  `comision_porcentaje` decimal(5,2) DEFAULT 0.00,
  `comision_fija` decimal(10,2) DEFAULT 0.00,
  `comision_final` decimal(12,2) NOT NULL,
  `monto_acreditado` decimal(12,2) NOT NULL,
  `fecha_acreditacion` date DEFAULT NULL,
  `banco_id` int(11) DEFAULT NULL,
  `conciliado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `numero` varchar(30) NOT NULL,
  `letra` varchar(1) NOT NULL,
  `punto_vta` int(11) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `estado` enum('PENDIENTE','PARCIAL','PAGADA') DEFAULT 'PENDIENTE',
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `saldo` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `cliente_id`, `fecha`, `numero`, `letra`, `punto_vta`, `total`, `estado`, `observacion`, `created_at`, `updated_at`, `saldo`) VALUES
(69, 1, '2026-01-19', '11', 'B', 1, 5000.00, 'PAGADA', NULL, '2026-01-19 20:16:39', '2026-01-19 20:16:39', 0.00),
(70, 2, '2026-01-19', '63', 'A', 1, 5000.00, 'PENDIENTE', NULL, '2026-01-19 21:49:00', '2026-01-19 21:49:00', 5000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_ajustes_pie`
--

CREATE TABLE `factura_ajustes_pie` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `porcentaje` decimal(10,2) NOT NULL,
  `monto` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_compras`
--

CREATE TABLE `factura_compras` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `numero` int(11) NOT NULL,
  `letra` varchar(1) NOT NULL,
  `punto_vta` int(11) NOT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','PARCIAL','PAGADA') NOT NULL DEFAULT 'PENDIENTE',
  `observacion` text DEFAULT NULL,
  `saldo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_compras`
--

INSERT INTO `factura_compras` (`id`, `proveedor_id`, `fecha`, `numero`, `letra`, `punto_vta`, `total`, `estado`, `observacion`, `saldo`, `created_at`, `updated_at`) VALUES
(25, 5, '2026-01-20 20:06:10', 2, 'A', 1, 1301.22, 'PENDIENTE', NULL, 1301.22, '2026-01-20 23:11:31', '2026-01-20 23:11:31'),
(28, 4, '2026-01-20 20:50:19', 1, '1', 10, 4167.83, 'PENDIENTE', NULL, 4167.83, '2026-01-20 23:56:05', '2026-01-20 23:56:05'),
(29, 5, '2026-01-20 18:21:30', 1121212, 'a', 1234, 1938.00, 'PENDIENTE', NULL, 1938.00, '2026-01-20 21:21:44', '2026-01-20 21:21:44'),
(30, 5, '2026-01-21 18:25:49', 11111, 'a', 10, 51.50, 'PENDIENTE', NULL, 51.50, '2026-01-21 21:52:30', '2026-01-21 21:52:30'),
(31, 5, '2026-01-21 18:25:49', 1111, 'a', 10, 51.50, 'PENDIENTE', NULL, 51.50, '2026-01-21 21:53:35', '2026-01-21 21:53:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_compra_ajustes_pie`
--

CREATE TABLE `factura_compra_ajustes_pie` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `porcentaje` decimal(10,2) NOT NULL DEFAULT 0.00,
  `monto` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_compra_ajustes_pie`
--

INSERT INTO `factura_compra_ajustes_pie` (`id`, `factura_id`, `nombre`, `porcentaje`, `monto`) VALUES
(3, 25, 'dto 1', -10.00, 0.00),
(4, 25, 'dto2 ', -2.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_compra_detalle`
--

CREATE TABLE `factura_compra_detalle` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `articulo_id` int(11) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `cantidad` decimal(12,2) NOT NULL DEFAULT 1.00,
  `ajuste` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_compra` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `centro_costo_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_compra_detalle`
--

INSERT INTO `factura_compra_detalle` (`id`, `factura_id`, `articulo_id`, `descripcion`, `cantidad`, `ajuste`, `precio_compra`, `iva`, `subtotal`, `centro_costo_id`, `created_at`) VALUES
(37, 25, NULL, 'Caja de Guantes Nitrilo', 1.00, 1.00, 100.00, 1.00, 0.00, NULL, '2026-01-20 23:11:31'),
(38, 25, NULL, 'Alcohol Etílico 1L', 2.00, 2.00, 200.00, 1.00, 0.00, NULL, '2026-01-20 23:11:31'),
(39, 25, NULL, 'Barbijo Tricapa', 3.00, 3.00, 300.00, 1.00, 0.00, NULL, '2026-01-20 23:11:31'),
(40, 28, NULL, 'Resma A4 80g', 1.00, -1.00, 1500.55, 21.00, 0.00, NULL, '2026-01-20 23:56:05'),
(41, 28, NULL, 'Tóner HP 85A', 2.00, -2.00, 1200.00, 21.00, 0.00, NULL, '2026-01-20 23:56:05'),
(42, 28, NULL, 'Lapicera Azul Bic', 3.00, -3.00, 113.50, 21.00, 0.00, NULL, '2026-01-20 23:56:05'),
(43, 29, NULL, 'Alcohol Etílico 1L', 1.00, 2.00, 1900.00, 21.00, 0.00, NULL, '2026-01-20 21:21:44'),
(44, 30, NULL, 'Alcohol Etílico 1L', 4.00, 5.00, 10.00, 21.00, 0.00, NULL, '2026-01-21 21:52:30'),
(45, 30, NULL, 'Barbijo Tricapa', 1.00, -5.00, 10.00, 21.00, 0.00, NULL, '2026-01-21 21:52:30'),
(46, 31, NULL, 'Alcohol Etílico 1L', 4.00, 5.00, 10.00, 21.00, 42.00, NULL, '2026-01-21 21:53:35'),
(47, 31, NULL, 'Barbijo Tricapa', 1.00, -5.00, 10.00, 21.00, 9.50, NULL, '2026-01-21 21:53:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_compra_impuestos`
--

CREATE TABLE `factura_compra_impuestos` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `impuesto_id` int(11) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `codigo` varchar(20) DEFAULT NULL,
  `alicuota` decimal(10,2) DEFAULT NULL,
  `base_imponible` decimal(12,2) NOT NULL DEFAULT 0.00,
  `monto` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_compra_impuestos`
--

INSERT INTO `factura_compra_impuestos` (`id`, `factura_id`, `impuesto_id`, `nombre`, `codigo`, `alicuota`, `base_imponible`, `monto`) VALUES
(4, 25, 0, 'IIBB CBA 3%', 'IIBBCBA3', 3.00, 1251.17, 37.54);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_detalle`
--

CREATE TABLE `factura_detalle` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `articulo_id` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `ajuste` decimal(10,2) NOT NULL,
  `precio_venta` decimal(12,2) NOT NULL,
  `iva` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`cantidad` * `precio_venta`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `centro_costo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura_detalle`
--

INSERT INTO `factura_detalle` (`id`, `factura_id`, `articulo_id`, `descripcion`, `cantidad`, `ajuste`, `precio_venta`, `iva`, `created_at`, `centro_costo_id`) VALUES
(114, 69, 6, 'CUMPLEAÑOS', 1.00, 0.00, 5000.00, 21.00, '2026-01-19 20:16:39', 1),
(115, 70, 6, 'CUMPLEAÑOS', 1.00, 0.00, 5000.00, 21.00, '2026-01-19 21:49:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_venta_impuestos`
--

CREATE TABLE `factura_venta_impuestos` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `impuesto_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `alicuota` varchar(6) NOT NULL,
  `base_imponible` decimal(12,2) NOT NULL,
  `monto` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `familias`
--

CREATE TABLE `familias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `familias`
--

INSERT INTO `familias` (`id`, `nombre`) VALUES
(1, 'familia 1'),
(2, 'familia 2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `impuestos`
--

CREATE TABLE `impuestos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `alicuota` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `impuestos`
--

INSERT INTO `impuestos` (`id`, `codigo`, `nombre`, `alicuota`) VALUES
(0, 'IIBBCBA3', 'IIBB CBA 3%', 3.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `iva`
--

CREATE TABLE `iva` (
  `id` int(11) NOT NULL,
  `porcentaje` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `iva`
--

INSERT INTO `iva` (`id`, `porcentaje`) VALUES
(1, 21.00),
(2, 10.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_bancarios`
--

CREATE TABLE `movimientos_bancarios` (
  `id` int(11) NOT NULL,
  `banco_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('INGRESO','EGRESO') NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `referencia` text DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `pago_venta_id` int(11) DEFAULT NULL,
  `pago_compra_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_bancarios`
--

INSERT INTO `movimientos_bancarios` (`id`, `banco_id`, `fecha`, `tipo`, `monto`, `descripcion`, `referencia`, `user_id`, `pago_venta_id`, `pago_compra_id`) VALUES
(20, 1, '2026-01-19', 'INGRESO', 5000.00, 'Venta factura B 1-11', '121212', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,4) NOT NULL,
  `metodo` enum('EFECTIVO','TARJETA','TRANSFERENCIA') NOT NULL,
  `banco_id` int(11) DEFAULT NULL,
  `lote` varchar(50) DEFAULT NULL,
  `cupon` varchar(50) DEFAULT NULL,
  `tarjeta` varchar(50) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `comprobante` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id`, `cliente_id`, `fecha`, `monto`, `metodo`, `banco_id`, `lote`, `cupon`, `tarjeta`, `observacion`, `comprobante`, `created_at`, `updated_at`) VALUES
(41, 1, '2026-01-19', 5000.0000, 'TRANSFERENCIA', 1, '', '', '', '', '121212', '2026-01-19 20:16:39', '2026-01-21 21:33:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos_compras`
--

CREATE TABLE `pagos_compras` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `metodo` enum('EFECTIVO','TARJETA','TRANSFERENCIA') NOT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `lote` varchar(50) DEFAULT NULL,
  `cupon` varchar(50) DEFAULT NULL,
  `tarjeta` varchar(50) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `comprobante` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `razonsocial` varchar(100) NOT NULL,
  `iva` enum('Exento','Monotributista','Resp,No Inscripto','No Responsable','Resp. Inscripto') DEFAULT NULL,
  `iibb` enum('Inscripto','No Inscripto','Exento','Convenio','Convenio media tasa','Agente','','') DEFAULT NULL,
  `numiibb` varchar(14) DEFAULT NULL,
  `cuit` varchar(11) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `nota` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `razonsocial`, `iva`, `iibb`, `numiibb`, `cuit`, `direccion`, `telefono`, `email`, `nota`, `created_at`, `updated_at`) VALUES
(4, 'Proveedor 1', 'Proveedor 1', NULL, NULL, NULL, '22222222', NULL, NULL, NULL, NULL, '2025-11-22 14:28:40', '2026-01-21 15:51:01'),
(5, 'Proveedor 2', 'Proveedor 2', 'Monotributista', 'Inscripto', NULL, '111111111', NULL, NULL, NULL, NULL, '2025-11-22 14:28:40', '2026-01-21 15:50:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor_articulos`
--

CREATE TABLE `proveedor_articulos` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `articulo_id` int(11) NOT NULL,
  `precio_compra` decimal(12,2) DEFAULT NULL,
  `codigo_proveedor` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor_articulos`
--

INSERT INTO `proveedor_articulos` (`id`, `proveedor_id`, `articulo_id`, `precio_compra`, `codigo_proveedor`, `activo`) VALUES
(1, 4, 1, 4500.00, 'P1-RESMA', 1),
(2, 4, 2, 38000.00, 'P1-TONER', 1),
(3, 4, 3, 350.00, 'P1-LAPIC', 1),
(4, 5, 4, 7200.00, 'P2-GUANTE', 1),
(5, 5, 5, 1900.00, 'P2-ALCO', 1),
(6, 5, 6, 1200.00, 'P2-BARB', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntos_venta`
--

CREATE TABLE `puntos_venta` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `punto_venta` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `tipo_comprobante` enum('FACTURA','NC') NOT NULL,
  `letra` enum('A','B','C') NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `puntos_venta`
--

INSERT INTO `puntos_venta` (`id`, `usuario_id`, `nombre`, `punto_venta`, `numero`, `tipo_comprobante`, `letra`, `activo`) VALUES
(1, 2, 'FACTURA A', 1, 69, 'FACTURA', 'A', 1),
(2, 2, 'FACTURA B', 1, 10, 'FACTURA', 'B', 1),
(3, 2, 'FACTURA PV 2', 2, 100, 'FACTURA', 'B', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas_credito`
--

CREATE TABLE `tarjetas_credito` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `entidad` varchar(100) DEFAULT NULL,
  `tipo` enum('debito','credito','ambas') DEFAULT 'credito',
  `comision_porcentaje` decimal(5,2) DEFAULT 0.00,
  `comision_fija` decimal(10,2) DEFAULT 0.00,
  `nota` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas_movimientos`
--

CREATE TABLE `tarjetas_movimientos` (
  `id` int(11) NOT NULL,
  `tarjeta_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `lote` varchar(50) DEFAULT NULL,
  `cuota` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) NOT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `access` varchar(500) DEFAULT NULL,
  `punto_venta_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `usuario`, `password`, `access`, `punto_venta_id`) VALUES
(2, 'admin', 'admin', 'admin', '$2b$10$ylvqB5R5qAatwYP3r.SNTeS6i5GW8Ya6rNSstF7iJVLq6kmjCKNEC', 'proveedores,listado-bancos, conceptos-bancarios,clientes,articulos,movimientos-bancarios,ordenes-de-pago-clientes,clientes-cuentas-corrientes', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aplicaciones_pagos`
--
ALTER TABLE `aplicaciones_pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pago_id` (`pago_id`),
  ADD KEY `factura_id` (`factura_id`);

--
-- Indices de la tabla `aplicaciones_pagos_compras`
--
ALTER TABLE `aplicaciones_pagos_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_apc_pago` (`pago_id`),
  ADD KEY `idx_apc_factura` (`factura_id`);

--
-- Indices de la tabla `articulos`
--
ALTER TABLE `articulos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `articulos_cc_fk` (`centro_costo_id`),
  ADD KEY `iva_id` (`iva_id`),
  ADD KEY `familia_id` (`familia_id`,`categoria_id`,`clasificacion_id`),
  ADD KEY `clasificacion_id` (`clasificacion_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `articulos_compras`
--
ALTER TABLE `articulos_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_centro-costo` (`id_centro-costo`);

--
-- Indices de la tabla `bancos`
--
ALTER TABLE `bancos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `caja`
--
ALTER TABLE `caja`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `caja_movimientos`
--
ALTER TABLE `caja_movimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caja_id` (`caja_id`),
  ADD KEY `gasto_id` (`gasto_id`),
  ADD KEY `venta_id` (`venta_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias_gastos`
--
ALTER TABLE `categorias_gastos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `centros_costos`
--
ALTER TABLE `centros_costos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clasificaciones`
--
ALTER TABLE `clasificaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cuentas_bancarias`
--
ALTER TABLE `cuentas_bancarias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `banco_id` (`banco_id`);

--
-- Indices de la tabla `cupones_tarjeta`
--
ALTER TABLE `cupones_tarjeta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarjeta_id` (`tarjeta_id`),
  ADD KEY `banco_id` (`banco_id`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `factura_ajustes_pie`
--
ALTER TABLE `factura_ajustes_pie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`);

--
-- Indices de la tabla `factura_compras`
--
ALTER TABLE `factura_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_factura_compras_proveedor` (`proveedor_id`),
  ADD KEY `idx_factura_compras_fecha` (`fecha`);

--
-- Indices de la tabla `factura_compra_ajustes_pie`
--
ALTER TABLE `factura_compra_ajustes_pie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fcap_factura` (`factura_id`);

--
-- Indices de la tabla `factura_compra_detalle`
--
ALTER TABLE `factura_compra_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fcd_factura` (`factura_id`),
  ADD KEY `idx_fcd_articulo` (`articulo_id`);

--
-- Indices de la tabla `factura_compra_impuestos`
--
ALTER TABLE `factura_compra_impuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fci_factura` (`factura_id`),
  ADD KEY `impuesto_id` (`impuesto_id`);

--
-- Indices de la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`),
  ADD KEY `articulo_id` (`articulo_id`),
  ADD KEY `fd_cc_fk` (`centro_costo_id`);

--
-- Indices de la tabla `factura_venta_impuestos`
--
ALTER TABLE `factura_venta_impuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`),
  ADD KEY `impuesto_id` (`impuesto_id`);

--
-- Indices de la tabla `familias`
--
ALTER TABLE `familias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `impuestos`
--
ALTER TABLE `impuestos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `iva`
--
ALTER TABLE `iva`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `movimientos_bancarios`
--
ALTER TABLE `movimientos_bancarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cuenta_bancaria_id` (`banco_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `banco_id` (`banco_id`);

--
-- Indices de la tabla `pagos_compras`
--
ALTER TABLE `pagos_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pc_factura` (`factura_id`),
  ADD KEY `idx_pc_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proveedor_articulos`
--
ALTER TABLE `proveedor_articulos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_proveedor_articulo` (`proveedor_id`,`articulo_id`),
  ADD KEY `articulo_id` (`articulo_id`);

--
-- Indices de la tabla `puntos_venta`
--
ALTER TABLE `puntos_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `tarjetas_credito`
--
ALTER TABLE `tarjetas_credito`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tarjetas_movimientos`
--
ALTER TABLE `tarjetas_movimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarjeta_id` (`tarjeta_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `punto_venta_id` (`punto_venta_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aplicaciones_pagos`
--
ALTER TABLE `aplicaciones_pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_pagos_compras`
--
ALTER TABLE `aplicaciones_pagos_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `articulos`
--
ALTER TABLE `articulos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `articulos_compras`
--
ALTER TABLE `articulos_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `bancos`
--
ALTER TABLE `bancos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `caja`
--
ALTER TABLE `caja`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `caja_movimientos`
--
ALTER TABLE `caja_movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_gastos`
--
ALTER TABLE `categorias_gastos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `centros_costos`
--
ALTER TABLE `centros_costos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cuentas_bancarias`
--
ALTER TABLE `cuentas_bancarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cupones_tarjeta`
--
ALTER TABLE `cupones_tarjeta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT de la tabla `factura_ajustes_pie`
--
ALTER TABLE `factura_ajustes_pie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `factura_compras`
--
ALTER TABLE `factura_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `factura_compra_ajustes_pie`
--
ALTER TABLE `factura_compra_ajustes_pie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `factura_compra_detalle`
--
ALTER TABLE `factura_compra_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `factura_compra_impuestos`
--
ALTER TABLE `factura_compra_impuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT de la tabla `iva`
--
ALTER TABLE `iva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `movimientos_bancarios`
--
ALTER TABLE `movimientos_bancarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `pagos_compras`
--
ALTER TABLE `pagos_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `proveedor_articulos`
--
ALTER TABLE `proveedor_articulos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `puntos_venta`
--
ALTER TABLE `puntos_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tarjetas_credito`
--
ALTER TABLE `tarjetas_credito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tarjetas_movimientos`
--
ALTER TABLE `tarjetas_movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aplicaciones_pagos`
--
ALTER TABLE `aplicaciones_pagos`
  ADD CONSTRAINT `aplicaciones_pagos_ibfk_1` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`),
  ADD CONSTRAINT `aplicaciones_pagos_ibfk_2` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `aplicaciones_pagos_compras`
--
ALTER TABLE `aplicaciones_pagos_compras`
  ADD CONSTRAINT `fk_apc_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura_compras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_apc_pago` FOREIGN KEY (`pago_id`) REFERENCES `pagos_compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `articulos`
--
ALTER TABLE `articulos`
  ADD CONSTRAINT `articulos_ibfk_1` FOREIGN KEY (`clasificacion_id`) REFERENCES `clasificaciones` (`id`),
  ADD CONSTRAINT `articulos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `articulos_ibfk_3` FOREIGN KEY (`iva_id`) REFERENCES `iva` (`id`),
  ADD CONSTRAINT `articulos_ibfk_4` FOREIGN KEY (`familia_id`) REFERENCES `familias` (`id`),
  ADD CONSTRAINT `articulos_ibfk_5` FOREIGN KEY (`centro_costo_id`) REFERENCES `centros_costos` (`id`);

--
-- Filtros para la tabla `articulos_compras`
--
ALTER TABLE `articulos_compras`
  ADD CONSTRAINT `articulos_compras_ibfk_1` FOREIGN KEY (`id`) REFERENCES `centros_costos` (`id`);

--
-- Filtros para la tabla `caja_movimientos`
--
ALTER TABLE `caja_movimientos`
  ADD CONSTRAINT `caja_movimientos_ibfk_1` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`),
  ADD CONSTRAINT `caja_movimientos_ibfk_3` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`);

--
-- Filtros para la tabla `cuentas_bancarias`
--
ALTER TABLE `cuentas_bancarias`
  ADD CONSTRAINT `cuentas_bancarias_ibfk_1` FOREIGN KEY (`banco_id`) REFERENCES `bancos` (`id`);

--
-- Filtros para la tabla `cupones_tarjeta`
--
ALTER TABLE `cupones_tarjeta`
  ADD CONSTRAINT `cupones_tarjeta_ibfk_1` FOREIGN KEY (`tarjeta_id`) REFERENCES `tarjetas_credito` (`id`),
  ADD CONSTRAINT `cupones_tarjeta_ibfk_2` FOREIGN KEY (`banco_id`) REFERENCES `bancos` (`id`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);

--
-- Filtros para la tabla `factura_ajustes_pie`
--
ALTER TABLE `factura_ajustes_pie`
  ADD CONSTRAINT `factura_ajustes_pie_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `factura_compras`
--
ALTER TABLE `factura_compras`
  ADD CONSTRAINT `factura_compras_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Filtros para la tabla `factura_compra_ajustes_pie`
--
ALTER TABLE `factura_compra_ajustes_pie`
  ADD CONSTRAINT `fk_fcap_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura_compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `factura_compra_detalle`
--
ALTER TABLE `factura_compra_detalle`
  ADD CONSTRAINT `factura_compra_detalle_ibfk_1` FOREIGN KEY (`articulo_id`) REFERENCES `articulos_compras` (`id`),
  ADD CONSTRAINT `fk_fcd_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura_compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `factura_compra_impuestos`
--
ALTER TABLE `factura_compra_impuestos`
  ADD CONSTRAINT `factura_compra_impuestos_ibfk_1` FOREIGN KEY (`impuesto_id`) REFERENCES `impuestos` (`id`),
  ADD CONSTRAINT `fk_fci_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura_compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `factura_detalle`
--
ALTER TABLE `factura_detalle`
  ADD CONSTRAINT `factura_detalle_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  ADD CONSTRAINT `factura_detalle_ibfk_2` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`),
  ADD CONSTRAINT `fd_cc_fk` FOREIGN KEY (`centro_costo_id`) REFERENCES `centros_costos` (`id`);

--
-- Filtros para la tabla `factura_venta_impuestos`
--
ALTER TABLE `factura_venta_impuestos`
  ADD CONSTRAINT `factura_venta_impuestos_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  ADD CONSTRAINT `factura_venta_impuestos_ibfk_2` FOREIGN KEY (`impuesto_id`) REFERENCES `impuestos` (`id`);

--
-- Filtros para la tabla `movimientos_bancarios`
--
ALTER TABLE `movimientos_bancarios`
  ADD CONSTRAINT `movimientos_bancarios_ibfk_1` FOREIGN KEY (`banco_id`) REFERENCES `cuentas_bancarias` (`id`),
  ADD CONSTRAINT `movimientos_bancarios_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`banco_id`) REFERENCES `bancos` (`id`);

--
-- Filtros para la tabla `pagos_compras`
--
ALTER TABLE `pagos_compras`
  ADD CONSTRAINT `fk_pc_factura` FOREIGN KEY (`factura_id`) REFERENCES `factura_compras` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proveedor_articulos`
--
ALTER TABLE `proveedor_articulos`
  ADD CONSTRAINT `proveedor_articulos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `proveedor_articulos_ibfk_2` FOREIGN KEY (`articulo_id`) REFERENCES `articulos_compras` (`id`);

--
-- Filtros para la tabla `puntos_venta`
--
ALTER TABLE `puntos_venta`
  ADD CONSTRAINT `puntos_venta_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `tarjetas_movimientos`
--
ALTER TABLE `tarjetas_movimientos`
  ADD CONSTRAINT `tarjetas_movimientos_ibfk_1` FOREIGN KEY (`tarjeta_id`) REFERENCES `tarjetas_credito` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
