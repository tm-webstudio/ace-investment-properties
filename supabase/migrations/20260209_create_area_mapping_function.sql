-- Create function to expand area names to their constituent local authorities
-- This enables matching properties by area (e.g., "East London") to find properties
-- in specific local authorities (e.g., "Tower Hamlets", "Hackney", etc.)

CREATE OR REPLACE FUNCTION expand_area_to_authorities(area_name TEXT)
RETURNS TEXT[] IMMUTABLE LANGUAGE plpgsql AS $$
DECLARE
  normalized_name TEXT;
BEGIN
  -- Normalize input: lowercase and trim
  normalized_name := LOWER(TRIM(area_name));

  -- Return local authorities for each recognized area
  RETURN CASE
    -- LONDON AREAS (7 areas → 33 local authorities)
    WHEN normalized_name = 'central london' THEN ARRAY[
      'City of London', 'Westminster', 'Camden', 'Islington'
    ]
    WHEN normalized_name = 'east london' THEN ARRAY[
      'Tower Hamlets', 'Hackney', 'Newham', 'Waltham Forest',
      'Redbridge', 'Barking and Dagenham', 'Havering'
    ]
    WHEN normalized_name = 'north london' THEN ARRAY[
      'Barnet', 'Enfield', 'Haringey'
    ]
    WHEN normalized_name = 'north west london' THEN ARRAY[
      'Brent', 'Harrow', 'Hillingdon', 'Ealing', 'Hounslow'
    ]
    WHEN normalized_name = 'south east london' THEN ARRAY[
      'Greenwich', 'Lewisham', 'Southwark', 'Lambeth', 'Bexley', 'Bromley'
    ]
    WHEN normalized_name = 'south west london' THEN ARRAY[
      'Wandsworth', 'Merton', 'Sutton', 'Kingston upon Thames',
      'Richmond upon Thames', 'Croydon'
    ]
    WHEN normalized_name = 'west london' THEN ARRAY[
      'Hammersmith and Fulham', 'Kensington and Chelsea'
    ]

    -- NORTH WEST (5 areas → 49 local authorities)
    WHEN normalized_name = 'greater manchester' THEN ARRAY[
      'Manchester', 'Salford', 'Bolton', 'Bury', 'Oldham',
      'Rochdale', 'Stockport', 'Tameside', 'Trafford', 'Wigan'
    ]
    WHEN normalized_name = 'merseyside' THEN ARRAY[
      'Liverpool', 'Knowsley', 'St. Helens', 'Sefton', 'Wirral'
    ]
    WHEN normalized_name = 'lancashire' THEN ARRAY[
      'Blackburn with Darwen', 'Blackpool', 'Burnley', 'Chorley',
      'Fylde', 'Hyndburn', 'Lancaster', 'Pendle', 'Preston',
      'Ribble Valley', 'Rossendale', 'South Ribble', 'West Lancashire', 'Wyre'
    ]
    WHEN normalized_name = 'cheshire' THEN ARRAY[
      'Cheshire East', 'Cheshire West and Chester', 'Halton', 'Warrington'
    ]
    WHEN normalized_name = 'cumbria' THEN ARRAY[
      'Allerdale', 'Barrow-in-Furness', 'Carlisle', 'Copeland',
      'Eden', 'South Lakeland', 'Cumberland', 'Westmorland and Furness'
    ]

    -- NORTH EAST & YORKSHIRE (6 areas → 27 local authorities)
    WHEN normalized_name = 'tyne and wear' THEN ARRAY[
      'Newcastle upon Tyne', 'Gateshead', 'South Tyneside',
      'North Tyneside', 'Sunderland'
    ]
    WHEN normalized_name = 'county durham' THEN ARRAY[
      'Durham', 'Darlington', 'Hartlepool', 'Stockton-on-Tees'
    ]
    WHEN normalized_name = 'northumberland' THEN ARRAY['Northumberland']
    WHEN normalized_name = 'west yorkshire' THEN ARRAY[
      'Leeds', 'Bradford', 'Kirklees', 'Calderdale', 'Wakefield'
    ]
    WHEN normalized_name = 'south yorkshire' THEN ARRAY[
      'Sheffield', 'Rotherham', 'Doncaster', 'Barnsley'
    ]
    WHEN normalized_name = 'north yorkshire' THEN ARRAY[
      'York', 'North Yorkshire', 'East Riding of Yorkshire',
      'Kingston upon Hull', 'Middlesbrough', 'Redcar and Cleveland',
      'Stockton-on-Tees'
    ]

    -- MIDLANDS (5 areas → 57 local authorities)
    WHEN normalized_name = 'west midlands' THEN ARRAY[
      'Birmingham', 'Coventry', 'Dudley', 'Sandwell', 'Solihull',
      'Walsall', 'Wolverhampton'
    ]
    WHEN normalized_name = 'east midlands' THEN ARRAY[
      'Derby', 'Leicester', 'Nottingham', 'Amber Valley', 'Bolsover',
      'Chesterfield', 'Derbyshire Dales', 'Erewash', 'High Peak',
      'North East Derbyshire', 'South Derbyshire', 'Blaby', 'Charnwood',
      'Harborough', 'Hinckley and Bosworth', 'Melton', 'North West Leicestershire',
      'Oadby and Wigston', 'Ashfield', 'Bassetlaw', 'Broxtowe',
      'Gedling', 'Mansfield', 'Newark and Sherwood', 'Rushcliffe'
    ]
    WHEN normalized_name = 'staffordshire' THEN ARRAY[
      'Stoke-on-Trent', 'Cannock Chase', 'East Staffordshire',
      'Lichfield', 'Newcastle-under-Lyme', 'South Staffordshire',
      'Stafford', 'Staffordshire Moorlands', 'Tamworth'
    ]
    WHEN normalized_name = 'warwickshire' THEN ARRAY[
      'North Warwickshire', 'Nuneaton and Bedworth', 'Rugby',
      'Stratford-on-Avon', 'Warwick'
    ]
    WHEN normalized_name = 'worcestershire and herefordshire' THEN ARRAY[
      'Herefordshire', 'Bromsgrove', 'Malvern Hills', 'Redditch',
      'Worcester', 'Wychavon', 'Wyre Forest'
    ]

    -- SOUTH EAST (7 areas → 75 local authorities)
    WHEN normalized_name = 'kent' THEN ARRAY[
      'Medway', 'Ashford', 'Canterbury', 'Dartford', 'Dover',
      'Folkestone and Hythe', 'Gravesham', 'Maidstone', 'Sevenoaks',
      'Swale', 'Thanet', 'Tonbridge and Malling', 'Tunbridge Wells'
    ]
    WHEN normalized_name = 'surrey' THEN ARRAY[
      'Elmbridge', 'Epsom and Ewell', 'Guildford', 'Mole Valley',
      'Reigate and Banstead', 'Runnymede', 'Spelthorne', 'Surrey Heath',
      'Tandridge', 'Waverley', 'Woking'
    ]
    WHEN normalized_name = 'sussex' THEN ARRAY[
      'Brighton and Hove', 'Eastbourne', 'Hastings', 'Lewes',
      'Rother', 'Wealden', 'Adur', 'Arun', 'Chichester', 'Crawley',
      'Horsham', 'Mid Sussex', 'Worthing'
    ]
    WHEN normalized_name = 'hampshire' THEN ARRAY[
      'Portsmouth', 'Southampton', 'Basingstoke and Deane', 'East Hampshire',
      'Eastleigh', 'Fareham', 'Gosport', 'Hart', 'Havant',
      'New Forest', 'Rushmoor', 'Test Valley', 'Winchester'
    ]
    WHEN normalized_name = 'berkshire' THEN ARRAY[
      'Bracknell Forest', 'Reading', 'Slough', 'West Berkshire',
      'Windsor and Maidenhead', 'Wokingham'
    ]
    WHEN normalized_name = 'buckinghamshire and oxfordshire' THEN ARRAY[
      'Buckinghamshire', 'Milton Keynes', 'Cherwell', 'Oxford',
      'South Oxfordshire', 'Vale of White Horse', 'West Oxfordshire'
    ]
    WHEN normalized_name = 'bedfordshire and hertfordshire' THEN ARRAY[
      'Bedford', 'Central Bedfordshire', 'Luton', 'Broxbourne',
      'Dacorum', 'East Hertfordshire', 'Hertsmere', 'North Hertfordshire',
      'St Albans', 'Stevenage', 'Three Rivers', 'Watford', 'Welwyn Hatfield'
    ]

    -- SOUTH WEST & EAST OF ENGLAND (9 areas → 76 local authorities)
    WHEN normalized_name = 'essex' THEN ARRAY[
      'Southend-on-Sea', 'Thurrock', 'Basildon', 'Braintree',
      'Brentwood', 'Castle Point', 'Chelmsford', 'Colchester',
      'Epping Forest', 'Harlow', 'Maldon', 'Rochford', 'Tendring', 'Uttlesford'
    ]
    WHEN normalized_name = 'norfolk and suffolk' THEN ARRAY[
      'Norwich', 'Breckland', 'Broadland', 'Great Yarmouth',
      'King''s Lynn and West Norfolk', 'North Norfolk', 'South Norfolk',
      'Ipswich', 'Babergh', 'East Suffolk', 'Mid Suffolk', 'West Suffolk'
    ]
    WHEN normalized_name = 'cambridgeshire' THEN ARRAY[
      'Cambridge', 'Peterborough', 'East Cambridgeshire', 'Fenland',
      'Huntingdonshire', 'South Cambridgeshire'
    ]
    WHEN normalized_name = 'bristol and somerset' THEN ARRAY[
      'Bath and North East Somerset', 'Bristol', 'North Somerset',
      'South Gloucestershire', 'Mendip', 'Sedgemoor', 'Somerset West and Taunton',
      'South Somerset'
    ]
    WHEN normalized_name = 'devon and cornwall' THEN ARRAY[
      'Plymouth', 'Torbay', 'East Devon', 'Exeter', 'Mid Devon',
      'North Devon', 'South Hams', 'Teignbridge', 'Torridge',
      'West Devon', 'Cornwall', 'Isles of Scilly'
    ]
    WHEN normalized_name = 'dorset' THEN ARRAY[
      'Bournemouth, Christchurch and Poole', 'Dorset'
    ]
    WHEN normalized_name = 'wiltshire' THEN ARRAY['Swindon', 'Wiltshire']
    WHEN normalized_name = 'gloucestershire' THEN ARRAY[
      'Cheltenham', 'Cotswold', 'Forest of Dean', 'Gloucester',
      'Stroud', 'Tewkesbury'
    ]
    WHEN normalized_name = 'lincolnshire' THEN ARRAY[
      'Lincoln', 'Boston', 'East Lindsey', 'North Kesteven',
      'South Kesteven', 'South Holland', 'West Lindsey', 'North Lincolnshire',
      'North East Lincolnshire'
    ]

    -- If not a recognized area, return the input as a single-element array
    -- This handles specific local authority names that users might enter directly
    ELSE ARRAY[area_name]
  END;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION expand_area_to_authorities(TEXT) IS
  'Expands area names (e.g., "East London", "Greater Manchester") to their constituent local authorities. Returns input as single-element array if not a recognized area name.';
