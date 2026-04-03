//
// This examples shows how we can receive a JSON packet from an
// external system (in this case a form from MetMoJi GEMBA Note)
// and then process the values from that JSON into Ontaura
// In this case we are creating a new Entity and populating attribute values
// rather than a data store time-series example
//
// This is done via an Open API so uses the requestBody as the source for the JSON message
//
// @author Ben Walshaw
//
test = false;
if (test) {
    requestBody = "{}";             // this is a little example of how to test the system during development using a preset JSON string rather than invoking the API each time
}


// Turn the JSON into an object
gembaMessage = JSON.parse(requestBody);

// Process the message and end
recordIncident(gembaMessage);




//
// This processes our source JSON (now a JavaScript object)
//
function recordIncident (gembaMessage) {

    // This is our incident variable
    var e;

    // Pull parameters - this is for the main page of the incident
    var companyName = gembaMessage.companyName;
    var siteName = gembaMessage.siteName;
    var documentId = gembaMessage.documentId;

    // Get checkboxes
    var cbFatality = gembaMessage.t00;
    var cbSpecifiedInjury = gembaMessage.t01;
    var cbOver7DayInjury = gembaMessage.t02;
    var cbReportableDisease = gembaMessage.t03;
    var cbIllHealth = gembaMessage.t04;
    var cbFirstAidOnSite = gembaMessage.t05;
    var cbMedicalTreatmentOffSite = gembaMessage.t06;
    var cbMinorIncidentInjuryNoAid = gembaMessage.t07;
    var cbDangerousOccurrenceRIDDOR = gembaMessage.t08;
    var cbEnvironmentalIncident = gembaMessage.t09;
    var cbNearMissDangerousOccurrence = gembaMessage.t10;
    var cbUtilityDamage = gembaMessage.t11;
    var cbTheftVandalismViolence = gembaMessage.t12;
    var cbComplaint = gembaMessage.t13;

    var hseNumber = gembaMessage.hseNumber;

    // If we are making a new entity to hold this incident report, generate it here.
    description = "Incident Report : " + companyName + " : " + siteName;
    
    // Create an entity to hold our incident report attributes
    // The type of entity is 'g.form.incident' from our taxonomy
    if (e === undefined || e === null) {
        
        // We are creating this example with the current date and time, but this could be sourced from the input message if needed
        e = Ontaura.entityFunctions.createEntity (Ontaura.createDateTime(), description, "g.form.incident", "");

        // If we couldn't create an incident you could mail the JSON so we can manually validate/apply later etc. in example we just return
        if (e === null) {
            return;
        }
    }

    // Pop in the attributes from the GEMBA Note to Gemini
    Ontaura.updateAttribute (e, "g.form.gemba.noteLink", gembaMessage._noteLink);
    Ontaura.updateAttribute (e, "g.form.gemba.pageLink", gembaMessage._pageLink);

    Ontaura.updateAttribute (e, "g.form.customerName", companyName);
    Ontaura.updateAttribute (e, "g.form.siteName", siteName);

    Ontaura.updateAttribute (e, "g.form.incident.fatality", cbFatality);
    Ontaura.updateAttribute (e, "g.form.incident.specifiedinjury", cbSpecifiedInjury);
    Ontaura.updateAttribute (e, "g.form.incident.over7dayinjury", cbOver7DayInjury);
    Ontaura.updateAttribute (e, "g.form.incident.reportabledisease", cbReportableDisease);
    Ontaura.updateAttribute (e, "g.form.incident.illhealth", cbIllHealth);
    Ontaura.updateAttribute (e, "g.form.incident.firstaidonsite", cbFirstAidOnSite);
    Ontaura.updateAttribute (e, "g.form.incident.medicaltreatment", cbMedicalTreatmentOffSite);
    Ontaura.updateAttribute (e, "g.form.incident.minorincident", cbMinorIncidentInjuryNoAid);
    Ontaura.updateAttribute (e, "g.form.incident.dangerousoccurrence", cbDangerousOccurrenceRIDDOR);
    Ontaura.updateAttribute (e, "g.form.incident.environmentalincident", cbEnvironmentalIncident);
    Ontaura.updateAttribute (e, "g.form.incident.nearmiss", cbNearMissDangerousOccurrence);
    Ontaura.updateAttribute (e, "g.form.incident.utilitydamage", cbUtilityDamage);
    Ontaura.updateAttribute (e, "g.form.incident.theftvandalismviolence", cbTheftVandalismViolence);
    Ontaura.updateAttribute (e, "g.form.incident.complaint", cbComplaint);
    Ontaura.updateAttribute (e, "g.hseNumber", hseNumber);


    // If this was a NEAR MISS type of incident (from a set flag in example) then we will also apply a TAG to this entity
    // so it can be listed, checked, escalated etc.  Remember that we can trigger events on flags as well as create
    // systems and widgets that will process them (e.g. a report, list on a master dashboard, email)
    if (cbNearMissDangerousOccurrence) Ontaura.addTagToEntity (e, "hs.nearmiss");

}