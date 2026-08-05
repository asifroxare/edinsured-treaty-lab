function runSimulation() {

    let retention = document.getElementById("retention").value;
    let limit = document.getElementById("limit").value;
    let simulations = document.getElementById("simulations").value;


    alert(
        "Treaty Submitted!\n\n" +
        "Retention: $" + retention +
        "\nLimit: $" + limit +
        "\nSimulations: " + simulations
    );

}