///
/// Importer for CSV based energy data exported
/// from Fusion Gemini energy template (for system to system transfers)
//
//  Format: (index line 0 is a header, data starts at index line 1 onwards)
//
/// deviceid,timestamp,updatedat,reading,intervalvalue
/// STRING,yyyy-MM-dd HH:mm,yyyy-MM-dd HH:mm,DOUBLE,DOUBLE
///
/// @Author Ben Walshaw
///

//
// Our CSV data is supplied in the dataPayload variable which is a string
// This is sent by external processes so it isn't limited to CSV - could be XML, JSON, BASE64 etc.
//
if (dataPayload !== null) {
    processCSV (dataPayload);
} else {
    Ontaura.body += "NO PAYLOAD SENT";
}




//
// This function takes a block of CSV data (as a string)
// and then splits it into lines
// it then processes each line, extracting the field data needed
// for storage and pipes it into an optimised database inserter
//
function processCSV (csvData) {

    numHeadersAdded = 0;
    lines = csvData.split("\n");

    // This creates an Ontaura bulk inserter for numeric fields
    // the name of the data store to insert into is 'test'
    // we are adding two fields at a time 'rd' and 'de' (both doubles)
    //
    importer = Ontaura.getBulkInsertNumeric ( "test" );
    template = Ontaura.getBulkInsertNumericTemplate();
    template.addFieldName("rd");  // reading
    template.addFieldName("de");  // interval / delta
    importer.setTemplate ( template );
    
    // Now that our template is ready we need to create an array to
    // hold insert records that it can process
    records = Ontaura.getBulkInsertNumericRecordArray();
    
    //
    // We have to start at line 1 to skip our header line
    // as per our CSV format (so we set l to 1)
    // This example is light on validating formats so you may
    // want to add checks for number of lines available etc.
    //
    for (l = 1; l < lines.length; l++) 
    {
        // Now split our line into columns
        // And validate that we have the expected columns for a processed line
        cols = lines[l].split(",");
        if ( cols.length == 5 ) {

            // And extract our deviceId from the CSV
            deviceid = cols[0];
            
            // Now our timestamp into a standard datetime for Ontaura
            //ts = Ontaura.toDateTime ( cols[1], "yyyy-MM-dd HH:mm" );     // This is a helper function that can convert from a CSV files format into an Ontaura compliant one
            ts = Ontaura.toDateTime ( cols[1] );

            // Now our Values
            rd = Ontaura.stringToDouble ( cols[3] );
            de = Ontaura.stringToDouble ( cols[4] );
            
            // Create an insert record and add our values to it
            record = Ontaura.getBulkInsertNumericRecord();
            record.reference = deviceid;
            record.ts = ts.toString();
            record.addValue ( rd );
            record.addValue ( de );
            
            // Add to our list of insert records
            records.add ( record );
            
            // flush cache if we hit our record limit
            // This is where you can optimise the insert process,
            // allowing for memory and ultimate SQL statement you can
            // set the auto flush size here for your needs
            if ( records.size() == 100 ) {
                results = importer.processDataSet ( records );
                records.clear();
            }
        }
    }

    //
    // If we still have some left over records to process
    // then send them here.  This process is explicit for
    // example purposes, but you could create a function
    // rather than lots of checks that auto flushes etc.
    //
    if ( records.size() > 0 ) {
        results = importer.processDataSet ( records );
    }

}