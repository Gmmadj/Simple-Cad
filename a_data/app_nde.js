jQuery(document).ready(function($) {
    var roof_cad; // #ndewidget_
    function InitNde()
    {
        $('#r_d_root').attr('data-height', $(window).height() * 1 );
        $('#r_d_root').attr('data-width', $(window).width() * 1 ); 
        roof_cad = new SimpleCad();
        roof_cad.Start({ 'cad_block_id': 'cad_block', 'type': 'sznde' , 'access_data' : $("#access_data").val() });
    }
    
    InitNde();
})
