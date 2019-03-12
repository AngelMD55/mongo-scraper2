//Scrape Articles from national association of realtors
$("#scrape").on("click", function(req, res){
    $.ajax({
        method: "GET",
        url: "/scrape"
    })
    .then(function(){
        location.reload();
    })
})

//Display scrapes articles
$.getJSON("/articles", function(data){
    for(let i= 0; i < data.length; i++){
        $("#articles").append("<div class='card'><div class='card-header'><h3><a href=" + data[i].url + ">" + data[i].title +"</a><a class='btn btn-success save ml-1' data-id=" + data[i]._id + ">Save Article</a><a class='btn btn-info notes' data-idn=" + data[i]._id + ">Notes</a></h3><div class='card-body'>" + data[i].summary + "</div></div></div>")
        // <p data-id='" + data[i]._id+ "'>" +data[i].title + "<br />" + data[i].url + "</p>");
    }
});

//Display saved articles
$.getJSON("/savedapi", function(data){
    for(let i= 0; i < data.length; i++){
        $("#savedArticles").append("<div class='card'><div class='card-header'><h3><a href=" + data[i].url + ">" + data[i].title +"</a><a class='btn btn-success unsave ml-1' data-id=" + data[i]._id + ">Delete Article</a><a class='btn btn-info notes' data-idn=" + data[i]._id + ">Notes</a></h3><div class='card-body'>" + data[i].summary + "</div></div></div>") 
        // <p data-id='" + data[i]._id+ "'>" +data[i].title + "<br />" + data[i].url + "</p>");
    }
});

//Onclick change saved to true
$(document).on("click", ".save", function(){
    
    let thisId = $(this).attr("data-id");
    console.log(thisId)

    $.ajax({
        method: "PUT",
        url: "/articles/" + thisId
    })
    .then(function(data){
    });
});

//Onclick chanfe saved to false
$(document).on("click", ".unsave", function(){
   
    let thisId = $(this).attr("data-id");
    console.log(thisId)

    $.ajax({
        method: "PUT",
        url: "/articles/" + thisId
    })
    .then(function(data){
        location.reload();
    });
});

// Onclick add classes to affect DOM
$(document).on("click", ".notes", function(){
    $(".articles1").addClass("col-8")
    $(".notes1").addClass("col-4")
    $("#notes").empty();

    let thisId = $(this).attr("data-idn");
    // console.log("thisId" + thisId)

    // ajax call to get article by id
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    .then(function(data){
        // create notes
        $(".notes1").append("<h3 class='bg-primary text-center pb-2 mb-1'>" +data.title + "</h3>");
        $(".notes1").append("<input id='titleInput' name='title' placeholder='Type Note Title'>");
        $(".notes1").append("<textarea id='bodyInput' name='body' placeholder='Type Note'></textarea>");
        $(".notes1").append("<button data-ids='" + data._id + "'id='saveNote' class='btn btn-success savebtn'>Save Note</button>")

        if (data.note){
            $("#titleInput").val(data.note.title);
            $("#bodyInput").val(data.note.body);
        }
    });
});

// on click to save articles and change DOM again
$(document).on("click", ".savebtn", function(){
    let thisId = $(this).attr("data-ids");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleInput").val(),
            body: $("#bodyInput").val()
        }
    })
    .then(function(data){
        $(".articles1").removeClass("col-8")
        $(".notes1").removeClass("col-4")
        console.log(data);
        $("#notes").empty();
    });

    $("#titleInput").val("");
    $("#bodyInput").val("");
});

$("#clear").on("click", function(){
    $("#articles").empty();
})