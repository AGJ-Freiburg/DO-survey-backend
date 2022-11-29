-- Database: `megapart`
--
CREATE DATABASE IF NOT EXISTS `megapart` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `megapart`;

-- --------------------------------------------------------

--
-- Table structure for table `eval`
--

CREATE TABLE `eval` (
  `ID` int NOT NULL,
  `answer` varchar(500) NOT NULL,
  `code` varchar(500) NOT NULL,
  `qid` int NOT NULL,
  `date` date NOT NULL,
  `agent` varchar(500) NOT NULL,
  `ip` varchar(500) NOT NULL,
  `text` varchar(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `pollstarted` date NOT NULL,
  `ref` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `eval`
--
