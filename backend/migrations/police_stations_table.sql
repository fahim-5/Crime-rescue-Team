-- Create police_stations table
CREATE TABLE IF NOT EXISTS police_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    thana VARCHAR(100) NOT NULL,
    address TEXT,
    phone_number VARCHAR(50),
    email VARCHAR(100),
    type VARCHAR(50),
    coordinates POINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for fast searching
CREATE INDEX IF NOT EXISTS idx_police_stations_district ON police_stations(district);
CREATE INDEX IF NOT EXISTS idx_police_stations_thana ON police_stations(thana);
CREATE INDEX IF NOT EXISTS idx_police_stations_name ON police_stations(name);

-- Insert sample data for Bangladesh police stations
INSERT INTO police_stations (name, district, thana, address, phone_number, email, type) VALUES
-- Dhaka District
('Adabor Police Station', 'Dhaka', 'Adabor', 'Adabor, Dhaka', '01713-373126', 'oc-adabor@police.gov.bd', 'Police Station'),
('Badda Police Station', 'Dhaka', 'Badda', 'Badda, Dhaka', '01713-373127', 'oc-badda@police.gov.bd', 'Police Station'),
('Banani Police Station', 'Dhaka', 'Banani', 'Banani, Dhaka', '01713-373128', 'oc-banani@police.gov.bd', 'Police Station'),
('Cantonment Police Station', 'Dhaka', 'Cantonment', 'Cantonment, Dhaka', '01713-373129', 'oc-cantonment@police.gov.bd', 'Police Station'),
('Chawkbazar Police Station', 'Dhaka', 'Chawkbazar', 'Chawkbazar, Dhaka', '01713-373130', 'oc-chawkbazar@police.gov.bd', 'Police Station'),
('Darus Salam Police Station', 'Dhaka', 'Mirpur', 'Darus Salam, Mirpur, Dhaka', '01713-373131', 'oc-darussalam@police.gov.bd', 'Police Station'),
('Demra Police Station', 'Dhaka', 'Demra', 'Demra, Dhaka', '01713-373132', 'oc-demra@police.gov.bd', 'Police Station'),
('Dhanmondi Police Station', 'Dhaka', 'Dhanmondi', 'Dhanmondi, Dhaka', '01713-373133', 'oc-dhanmondi@police.gov.bd', 'Police Station'),
('Gandaria Police Station', 'Dhaka', 'Gandaria', 'Gandaria, Dhaka', '01713-373134', 'oc-gandaria@police.gov.bd', 'Police Station'),
('Hazaribagh Police Station', 'Dhaka', 'Hazaribagh', 'Hazaribagh, Dhaka', '01713-373135', 'oc-hazaribagh@police.gov.bd', 'Police Station'),
('Jatrabari Police Station', 'Dhaka', 'Jatrabari', 'Jatrabari, Dhaka', '01713-373136', 'oc-jatrabari@police.gov.bd', 'Police Station'),
('Kadamtali Police Station', 'Dhaka', 'Kadamtali', 'Kadamtali, Dhaka', '01713-373137', 'oc-kadamtali@police.gov.bd', 'Police Station'),
('Khilgaon Police Station', 'Dhaka', 'Khilgaon', 'Khilgaon, Dhaka', '01713-373138', 'oc-khilgaon@police.gov.bd', 'Police Station'),
('Mirpur Police Station', 'Dhaka', 'Mirpur', 'Mirpur, Dhaka', '01713-373139', 'oc-mirpur@police.gov.bd', 'Police Station'),
('Mohammadpur Police Station', 'Dhaka', 'Mohammadpur', 'Mohammadpur, Dhaka', '01713-373140', 'oc-mohammadpur@police.gov.bd', 'Police Station'),
('Motijheel Police Station', 'Dhaka', 'Motijheel', 'Motijheel, Dhaka', '01713-373141', 'oc-motijheel@police.gov.bd', 'Police Station'),
('Mugda Police Station', 'Dhaka', 'Mugda', 'Mugda, Dhaka', '01713-373142', 'oc-mugda@police.gov.bd', 'Police Station'),
('Pallabi Police Station', 'Dhaka', 'Pallabi', 'Pallabi, Dhaka', '01713-373143', 'oc-pallabi@police.gov.bd', 'Police Station'),
('Ramna Police Station', 'Dhaka', 'Ramna', 'Ramna, Dhaka', '01713-373144', 'oc-ramna@police.gov.bd', 'Police Station'),
('Rampura Police Station', 'Dhaka', 'Rampura', 'Rampura, Dhaka', '01713-373145', 'oc-rampura@police.gov.bd', 'Police Station'),
('Sabujbagh Police Station', 'Dhaka', 'Sabujbagh', 'Sabujbagh, Dhaka', '01713-373146', 'oc-sabujbagh@police.gov.bd', 'Police Station'),
('Shahbagh Police Station', 'Dhaka', 'Shahbagh', 'Shahbagh, Dhaka', '01713-373147', 'oc-shahbagh@police.gov.bd', 'Police Station'),
('Sher-e-Bangla Nagar Police Station', 'Dhaka', 'Sher-e-Bangla Nagar', 'Sher-e-Bangla Nagar, Dhaka', '01713-373148', 'oc-sbanglanagar@police.gov.bd', 'Police Station'),
('Tejgaon Police Station', 'Dhaka', 'Tejgaon', 'Tejgaon, Dhaka', '01713-373149', 'oc-tejgaon@police.gov.bd', 'Police Station'),
('Uttara East Police Station', 'Dhaka', 'Uttara East', 'Uttara East, Dhaka', '01713-373150', 'oc-uttaraeast@police.gov.bd', 'Police Station'),
('Uttara West Police Station', 'Dhaka', 'Uttara West', 'Uttara West, Dhaka', '01713-373151', 'oc-uttarawest@police.gov.bd', 'Police Station'),

-- Narayanganj District
('Narayanganj Sadar Police Station', 'Narayanganj', 'Sadar', 'Narayanganj Sadar, Narayanganj', '01713-373160', 'oc-narayanganjsadar@police.gov.bd', 'Police Station'),
('Fatullah Police Station', 'Narayanganj', 'Fatullah', 'Fatullah, Narayanganj', '01713-373161', 'oc-fatullah@police.gov.bd', 'Police Station'),
('Bandar Police Station', 'Narayanganj', 'Bandar', 'Bandar, Narayanganj', '01713-373162', 'oc-bandar@police.gov.bd', 'Police Station'),
('Rupganj Police Station', 'Narayanganj', 'Rupganj', 'Rupganj, Narayanganj', '01713-373163', 'oc-rupganj@police.gov.bd', 'Police Station'),
('Sonargaon Police Station', 'Narayanganj', 'Sonargaon', 'Sonargaon, Narayanganj', '01713-373164', 'oc-sonargaon@police.gov.bd', 'Police Station'),

-- Chattogram District
('Kotwali Police Station', 'Chattogram', 'Kotwali', 'Kotwali, Chattogram', '01713-373170', 'oc-kotwali-ctg@police.gov.bd', 'Police Station'),
('Panchlaish Police Station', 'Chattogram', 'Panchlaish', 'Panchlaish, Chattogram', '01713-373171', 'oc-panchlaish@police.gov.bd', 'Police Station'),
('Sadarghat Police Station', 'Chattogram', 'Sadarghat', 'Sadarghat, Chattogram', '01713-373172', 'oc-sadarghat-ctg@police.gov.bd', 'Police Station'),
('Pahartali Police Station', 'Chattogram', 'Pahartali', 'Pahartali, Chattogram', '01713-373173', 'oc-pahartali@police.gov.bd', 'Police Station'),
('Double Mooring Police Station', 'Chattogram', 'Double Mooring', 'Double Mooring, Chattogram', '01713-373174', 'oc-doublemooring@police.gov.bd', 'Police Station'),
('Chandgaon Police Station', 'Chattogram', 'Chandgaon', 'Chandgaon, Chattogram', '01713-373175', 'oc-chandgaon@police.gov.bd', 'Police Station'),
('Halishahar Police Station', 'Chattogram', 'Halishahar', 'Halishahar, Chattogram', '01713-373176', 'oc-halishahar@police.gov.bd', 'Police Station'),
('Bakalia Police Station', 'Chattogram', 'Bakalia', 'Bakalia, Chattogram', '01713-373177', 'oc-bakalia@police.gov.bd', 'Police Station'),

-- Cox's Bazar District
('Cox's Bazar Sadar Police Station', 'Cox's Bazar', 'Sadar', 'Cox's Bazar Sadar, Cox's Bazar', '01713-373180', 'oc-coxsbazarsadar@police.gov.bd', 'Police Station'),
('Teknaf Police Station', 'Cox's Bazar', 'Teknaf', 'Teknaf, Cox's Bazar', '01713-373181', 'oc-teknaf@police.gov.bd', 'Police Station'),
('Ukhia Police Station', 'Cox's Bazar', 'Ukhia', 'Ukhia, Cox's Bazar', '01713-373182', 'oc-ukhia@police.gov.bd', 'Police Station'),
('Ramu Police Station', 'Cox's Bazar', 'Ramu', 'Ramu, Cox's Bazar', '01713-373183', 'oc-ramu@police.gov.bd', 'Police Station'),

-- Rajshahi District
('Boalia Police Station', 'Rajshahi', 'Boalia', 'Boalia, Rajshahi', '01713-373190', 'oc-boalia@police.gov.bd', 'Police Station'),
('Motihar Police Station', 'Rajshahi', 'Motihar', 'Motihar, Rajshahi', '01713-373191', 'oc-motihar@police.gov.bd', 'Police Station'),
('Rajpara Police Station', 'Rajshahi', 'Rajpara', 'Rajpara, Rajshahi', '01713-373192', 'oc-rajpara@police.gov.bd', 'Police Station'),
('Paba Police Station', 'Rajshahi', 'Paba', 'Paba, Rajshahi', '01713-373193', 'oc-paba@police.gov.bd', 'Police Station'),

-- Khulna District
('Khulna Sadar Police Station', 'Khulna', 'Sadar', 'Khulna Sadar, Khulna', '01713-373200', 'oc-khulnasadar@police.gov.bd', 'Police Station'),
('Sonadanga Police Station', 'Khulna', 'Sonadanga', 'Sonadanga, Khulna', '01713-373201', 'oc-sonadanga@police.gov.bd', 'Police Station'),
('Daulatpur Police Station', 'Khulna', 'Daulatpur', 'Daulatpur, Khulna', '01713-373202', 'oc-daulatpur@police.gov.bd', 'Police Station'),
('Khalishpur Police Station', 'Khulna', 'Khalishpur', 'Khalishpur, Khulna', '01713-373203', 'oc-khalishpur@police.gov.bd', 'Police Station'),

-- Sylhet District
('Kotwali Police Station', 'Sylhet', 'Kotwali', 'Kotwali, Sylhet', '01713-373210', 'oc-kotwali-syl@police.gov.bd', 'Police Station'),
('South Surma Police Station', 'Sylhet', 'South Surma', 'South Surma, Sylhet', '01713-373211', 'oc-southsurma@police.gov.bd', 'Police Station'),
('Jalalabad Police Station', 'Sylhet', 'Jalalabad', 'Jalalabad, Sylhet', '01713-373212', 'oc-jalalabad@police.gov.bd', 'Police Station'),
('Shahporan Police Station', 'Sylhet', 'Shahporan', 'Shahporan, Sylhet', '01713-373213', 'oc-shahporan@police.gov.bd', 'Police Station'),

-- Barisal District
('Kotwali Police Station', 'Barisal', 'Kotwali', 'Kotwali, Barisal', '01713-373220', 'oc-kotwali-bsl@police.gov.bd', 'Police Station'),
('Barisal Sadar Police Station', 'Barisal', 'Sadar', 'Barisal Sadar, Barisal', '01713-373221', 'oc-barisalsadar@police.gov.bd', 'Police Station'),
('Kawnia Police Station', 'Barisal', 'Kawnia', 'Kawnia, Barisal', '01713-373222', 'oc-kawnia@police.gov.bd', 'Police Station'),

-- Rangpur District
('Rangpur Kotwali Police Station', 'Rangpur', 'Kotwali', 'Kotwali, Rangpur', '01713-373230', 'oc-kotwali-rangpur@police.gov.bd', 'Police Station'),
('Rangpur Sadar Police Station', 'Rangpur', 'Sadar', 'Rangpur Sadar, Rangpur', '01713-373231', 'oc-rangpursadar@police.gov.bd', 'Police Station'),
('Gangachara Police Station', 'Rangpur', 'Gangachara', 'Gangachara, Rangpur', '01713-373232', 'oc-gangachara@police.gov.bd', 'Police Station'),

-- Mymensingh District
('Mymensingh Kotwali Police Station', 'Mymensingh', 'Kotwali', 'Kotwali, Mymensingh', '01713-373240', 'oc-kotwali-mymensingh@police.gov.bd', 'Police Station'),
('Mymensingh Sadar Police Station', 'Mymensingh', 'Sadar', 'Mymensingh Sadar, Mymensingh', '01713-373241', 'oc-mymensinghsadar@police.gov.bd', 'Police Station'),
('Trishal Police Station', 'Mymensingh', 'Trishal', 'Trishal, Mymensingh', '01713-373242', 'oc-trishal@police.gov.bd', 'Police Station'),

-- Bogra (Bogura) District
('Bogra Sadar Police Station', 'Bogura', 'Sadar', 'Bogra Sadar, Bogura', '01713-373250', 'oc-bograsadar@police.gov.bd', 'Police Station'),
('Bogra Kotwali Police Station', 'Bogura', 'Kotwali', 'Kotwali, Bogura', '01713-373251', 'oc-kotwali-bogra@police.gov.bd', 'Police Station'),
('Shibganj Police Station', 'Bogura', 'Shibganj', 'Shibganj, Bogura', '01713-373252', 'oc-shibganj@police.gov.bd', 'Police Station'),

-- Comilla (Cumilla) District
('Comilla Kotwali Police Station', 'Cumilla', 'Kotwali', 'Kotwali, Cumilla', '01713-373260', 'oc-kotwali-comilla@police.gov.bd', 'Police Station'),
('Comilla Sadar Police Station', 'Cumilla', 'Sadar', 'Comilla Sadar, Cumilla', '01713-373261', 'oc-comillasadar@police.gov.bd', 'Police Station'),
('Chauddagram Police Station', 'Cumilla', 'Chauddagram', 'Chauddagram, Cumilla', '01713-373262', 'oc-chauddagram@police.gov.bd', 'Police Station'),

-- Dinajpur District
('Dinajpur Kotwali Police Station', 'Dinajpur', 'Kotwali', 'Kotwali, Dinajpur', '01713-373270', 'oc-kotwali-dinajpur@police.gov.bd', 'Police Station'),
('Dinajpur Sadar Police Station', 'Dinajpur', 'Sadar', 'Dinajpur Sadar, Dinajpur', '01713-373271', 'oc-dinajpursadar@police.gov.bd', 'Police Station'),
('Biral Police Station', 'Dinajpur', 'Biral', 'Biral, Dinajpur', '01713-373272', 'oc-biral@police.gov.bd', 'Police Station'),

-- Feni District
('Feni Sadar Police Station', 'Feni', 'Sadar', 'Feni Sadar, Feni', '01713-373280', 'oc-fenisadar@police.gov.bd', 'Police Station'),
('Sonagazi Police Station', 'Feni', 'Sonagazi', 'Sonagazi, Feni', '01713-373281', 'oc-sonagazi@police.gov.bd', 'Police Station'),
('Daganbhuiyan Police Station', 'Feni', 'Daganbhuiyan', 'Daganbhuiyan, Feni', '01713-373282', 'oc-daganbhuiyan@police.gov.bd', 'Police Station'),

-- Tangail District
('Tangail Sadar Police Station', 'Tangail', 'Sadar', 'Tangail Sadar, Tangail', '01713-373290', 'oc-tangailsadar@police.gov.bd', 'Police Station'),
('Mirzapur Police Station', 'Tangail', 'Mirzapur', 'Mirzapur, Tangail', '01713-373291', 'oc-mirzapur@police.gov.bd', 'Police Station'),
('Kalihati Police Station', 'Tangail', 'Kalihati', 'Kalihati, Tangail', '01713-373292', 'oc-kalihati@police.gov.bd', 'Police Station'); 